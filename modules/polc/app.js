// --- SUPABASE & STATE ---
const SUPABASE_URL = 'https://cwfmbrjzumrrniqffnzd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Zm1icmp6dW1ycm5pcWZmbnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDUxNDksImV4cCI6MjA4NzE4MTE0OX0.BcddKKfB5e2yJVKSqfKSetG_0LRZMEhq8DEbII9o0CI';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentTheme = localStorage.getItem('theme') || 'dark';
let activeView = 'dashboard';
let neoNodes = [];
let flatNeoNodes = []; // Flattened list for selects
let activeNeoNodeId = null;
let currentInvoices = []; // For filtering/searching

// --- GLOBAL CONFIG ---
const UTIL_TYPES = {
    gas: { label: 'Gáz', icon: 'fa-fire', color: '#ff5252', unit: 'm³', trendId: 'gas-trend' },
    electricity: { label: 'Villany', icon: 'fa-bolt', color: '#fbc02d', unit: 'kWh', trendId: 'elec-trend' },
    water: { label: 'Víz', icon: 'fa-droplet', color: '#2196f3', unit: 'm³', trendId: 'water-trend' },
    heating: { label: 'Fűtés', icon: 'fa-temperature-high', color: '#ff9800', unit: 'GJ', trendId: 'heat-trend' }
};

// --- DOM ELEMENTS ---
const themeToggle = document.getElementById('theme-toggle');
const dateEl = document.getElementById('current-date');
const timeEl = document.getElementById('current-time');
const navLinks = document.querySelectorAll('.nav-link');
const viewPanes = document.querySelectorAll('.view-pane');

// --- THEME ENGINE ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
});

// Branding navigation
document.querySelector('.branding').addEventListener('click', () => {
    switchView('dashboard');
});

// --- CLOCK ENGINE ---
function updateClock() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    dateEl.textContent = now.toLocaleDateString('hu-HU', dateOptions);
    timeEl.textContent = now.toLocaleTimeString('hu-HU', timeOptions);
}

// --- NAVIGATION ---
function switchView(viewId) {
    activeView = viewId;
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewId));
    viewPanes.forEach(pane => pane.classList.toggle('active', pane.id === `${viewId}-view`));

    if (viewId === 'neo') {
        renderNeoTree(document.getElementById('neo-search')?.value || '');
    }
    if (viewId === 'dashboard') refreshDashboard();
    if (viewId === 'logs') fetchLogsWithDelta();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(link.dataset.view);
    });
});

// Load NEO_DATA if available
if (typeof NEO_DATA !== 'undefined') {
    neoNodes = NEO_DATA;
    syncUtilityLocations();
}

// --- DASHBOARD DATA ---
async function refreshDashboard() {
    try {
        for (const [type, config] of Object.entries(UTIL_TYPES)) {
            const { data } = await supabaseClient
                .from('utility_records')
                .select('meter_reading, entry_date')
                .eq('type', type)
                .order('entry_date', { ascending: false })
                .limit(2);

            const cardEl = document.getElementById(config.trendId);
            if (!cardEl) continue;

            const statEl = cardEl.querySelector('.main-stat');
            const trendEl = cardEl.querySelector('.trend');

            if (data?.[0]) {
                statEl.innerHTML = `${data[0].meter_reading.toLocaleString('hu-HU')} <small>${config.unit}</small>`;
                if (data[1]) {
                    const diff = (data[0].meter_reading - data[1].meter_reading).toFixed(1);
                    const isUp = parseFloat(diff) > 0;
                    trendEl.className = `trend ${isUp ? 'up' : 'down'}`;
                    trendEl.innerHTML = `<i class="fas fa-arrow-${isUp ? 'up' : 'down'}"></i> ${Math.abs(diff)} ${config.unit} változás`;
                }
            } else {
                statEl.innerHTML = `0 <small>${config.unit}</small>`;
                trendEl.innerHTML = `<i class="fas fa-minus"></i> Nincs adat`;
            }
        }

        // Invoice count
        const totalInvEl = document.getElementById('total-invoices');
        if (totalInvEl) {
            const { count } = await supabaseClient.from('neo_invoices').select('*', { count: 'exact', head: true });
            totalInvEl.textContent = count || 0;
        }
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

// --- UTILS ---
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Theme-aware toast background for light mode
    if (document.body.classList.contains('light-theme') || document.body.getAttribute('data-theme') === 'light') {
        toast.style.background = '#ffffff';
        toast.style.color = '#000000';
        toast.style.border = '2px solid #000000';
        toast.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
    }

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${msg}</span>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 500); }, 3500);
}

function sanitizeFileName(name) {
    return name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildOcrPayload(nodeId, r, pdfUrl) {
    const opt = (v) => (v && v !== '—' ? v : null);
    return {
        node_id: nodeId,
        provider: r.provider || 'Ismeretlen',
        invoice_type: r.type || 'SZÁMLA',
        invoice_serial: r.serial && r.serial !== '—' ? r.serial : null,
        invoice_date: r.date || null,
        amount: Number(r.amount) || 0,
        currency: r.currency || 'Ft',
        pdf_url: pdfUrl || null,
        buyer_name: opt(r.buyerName),
        consumption_address: opt(r.consumptionAddress),
        pod_id: opt(r.podId),
        meter_serial: opt(r.meterSerial),
        net_amount: opt(r.netAmount),
        vat_amount: opt(r.vatAmount),
        billing_period: opt(r.billingPeriod),
        contract_number: opt(r.contractNumber),
        payment_method: opt(r.paymentMethod),
        customer_id: opt(r.customerId),
        billing_address: opt(r.billingAddress),
        service_address: opt(r.serviceAddress),
        notes: opt(r.notes)
    };
}

// --- UTILITY MODULE ---
const utilityForm = document.getElementById('entry-form');
const utilityContainer = document.getElementById('entries-container');

utilityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('status-msg');
    status.textContent = 'Mentés...';
    status.className = 'status-msg';

    const photoInput = document.getElementById('meter-photo');
    const photoFile = photoInput.files[0];
    let photoUrl = null;

    if (photoFile) {
        const fileName = `${Date.now()}_${sanitizeFileName(photoFile.name)}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('utility-photos')
            .upload(fileName, photoFile);

        if (uploadError) {
            status.textContent = 'Hiba a kép feltöltése során: ' + uploadError.message;
            status.style.color = '#ff5252';
            return;
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from('utility-photos')
            .getPublicUrl(fileName);

        photoUrl = publicUrl;
    }

    const payload = {
        type: document.getElementById('record-type').value,
        location_name: document.getElementById('location-name').value || 'Ismeretlen hely',
        entry_date: document.getElementById('entry-date').value || new Date().toISOString().split('T')[0],
        meter_reading: parseFloat(document.getElementById('meter-reading').value) || 0,
        last_settled_reading: parseFloat(document.getElementById('last-settled').value) || null,
        photo_url: photoUrl
    };

    const { error } = await supabaseClient.from('utility_records').insert([payload]);
    if (error) {
        showToast('Hiba: ' + error.message, 'error');
    } else {
        showToast('Adatok sikeresen rögzítve!');
        utilityForm.reset();
        document.getElementById('meter-photo-label').textContent = 'Válassz egy képet...';
        fetchUtilityRecords();
        refreshDashboard();
    }
});

async function fetchLogsWithDelta() {
    const container = document.getElementById('logs-container');
    container.innerHTML = '<p class="logs-loading">Adatok betöltése...</p>';

    const { data } = await supabaseClient.from('utility_records').select('*').order('entry_date', { ascending: true });

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="logs-empty">Nincsenek rögzített adatok.</p>';
        return;
    }

    // Group by type and location
    const groups = {};
    data.forEach(r => {
        const key = `${r.type}_${r.location_name}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
    });

    let html = '';
    for (const key in groups) {
        const sorted = groups[key];
        const typeLabel = {
            gas: 'Földgáz',
            electricity: 'Villany',
            water: 'Víz',
            heating: 'Fűtés'
        }[sorted[0].type] || sorted[0].type;

        html += `<div style="margin-bottom: 2rem;">
                    <h4 style="color:var(--amber); border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem; margin-bottom:1rem;">
                        ${typeLabel} - ${sorted[0].location_name}
                    </h4>
                    <table class="premium-table" style="width:100%;">
                        <thead>
                            <tr style="text-align:left; font-size: 0.75rem; color: var(--amber);">
                                <th>DÁTUM</th><th>ÁLLÁS</th><th>KÜLÖNBSÉG (Δ)</th><th>FOTÓ</th>
                            </tr>
                        </thead>
                        <tbody>`;

        sorted.reverse().forEach((r, idx) => {
            const prev = sorted[idx + 1];
            const delta = prev ? (r.meter_reading - prev.meter_reading).toFixed(2) : '-';
            const deltaClass = delta > 0 ? 'trend-pill up' : 'trend-pill down';

            html += `<tr>
                        <td class="cell-date">${r.entry_date}</td>
                        <td style="font-weight:700;">${r.meter_reading}</td>
                        <td><span class="${deltaClass}">${delta > 0 ? '+' : ''}${delta}</span></td>
                        <td style="text-align: center; vertical-align: middle;">
                            ${r.photo_url ? `<a href="${r.photo_url}" target="_blank" rel="noopener" class="btn-table btn-view" title="Kép megtekintése"><i class="fas fa-camera"></i></a>` : '<button class="btn-table disabled" title="Nincs fénykép"><i class="fas fa-camera-retro" style="opacity: 0.3;"></i></button>'}
                        </td>
                    </tr>`;
        });

        html += `</tbody></table></div>`;
    }
    container.innerHTML = html;
}

async function fetchUtilityRecords() {
    const { data } = await supabaseClient.from('utility_records').select('*').order('entry_date', { ascending: false });
    if (data) renderUtilityRecords(data);
}

function renderUtilityRecords(records) {
    const filterBtn = document.querySelector('#utility-type-tabs .tab-btn.active');
    const filter = filterBtn ? filterBtn.dataset.type : 'all';
    const filtered = filter === 'all' ? records : records.filter(r => r.type === filter);

    utilityContainer.innerHTML = filtered.map(r => `
        <div class="glass-card reveal active" style="margin-bottom: 1rem; border-left: 4px solid var(--amber);">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <span class="entry-type">${{ gas: 'Gáz', electricity: 'Villany', water: 'Víz', heating: 'Távhő' }[r.type] || r.type}</span>
                    <h4 style="color:var(--amber);">${r.location_name}</h4>
                </div>
                <div class="entry-date">${r.entry_date}</div>
            </div>
            <div style="display:flex; gap:2rem; margin-top:1rem;">
                <div><small class="entry-label">ÁLLÁS</small><strong>${r.meter_reading}</strong></div>
                ${r.photo_url ? `<div style="margin-left:auto;"><img src="${r.photo_url}" style="width:70px; height:70px; object-fit:cover; border-radius:8px; border: 1px solid var(--glass-border); cursor:pointer; transition: transform 0.2s;" onclick="window.open('${r.photo_url}','_blank')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>` : ''}
            </div>
        </div>
    `).join('');
}

// Initial records fetch
fetchUtilityRecords();

// Filter logic
document.querySelectorAll('#utility-type-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#utility-type-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchUtilityRecords();
    });
});

// File input label update
const meterPhotoInput = document.getElementById('meter-photo');
const meterPhotoLabel = document.getElementById('meter-photo-label');
meterPhotoInput.onchange = (e) => {
    meterPhotoLabel.textContent = e.target.files[0]?.name || 'Válassz egy képet...';
};

// --- NEO MODULE (FIXED TREE) ---
// NEO nodes are loaded from neo.js


function nodeMatchesSearch(nodeId, q) {
    const node = neoNodes.find(n => n.id === nodeId);
    if (!node) return false;
    if (node.label.toLowerCase().includes(q)) return true;
    return neoNodes.filter(n => n.parent_id === nodeId).some(c => nodeMatchesSearch(c.id, q));
}

function renderNeoTree(searchTerm = '') {
    const treeContainer = document.getElementById('tree-view');
    treeContainer.innerHTML = '';
    const q = (searchTerm || '').toLowerCase().trim();

    const nodeMatches = (node, query) => {
        const label = String(node.label || "").toLowerCase();
        const type = String(node.type || "").toLowerCase();
        const node_type = String(node.node_type || "").toLowerCase();
        const id = String(node.id || "").toLowerCase();
        return label.includes(query) || type.includes(query) || node_type.includes(query) || id.includes(query);
    };

    const hasMatchingChild = (node, query) => {
        if (!node.children) return false;
        return node.children.some(child => nodeMatches(child, query) || hasMatchingChild(child, query));
    };

    const draw = (nodes, container, depth = 0, forceShow = false) => {
        nodes.forEach(node => {
            const matches = q && nodeMatches(node, q);
            const isMatch = !q || matches || hasMatchingChild(node, q) || forceShow;
            if (q && !isMatch) return;

            const hasChildren = node.children && node.children.length > 0;
            const nodeEl = document.createElement('div');
            // Root node and matches (or forced) are expanded by default
            const isExpanded = depth === 0 || (q && isMatch);
            nodeEl.className = `tree-node ${hasChildren && !isExpanded ? 'collapsed' : ''}`;

            const content = document.createElement('div');
            const nodeId = node.id || String(node.label || "Névtelen");
            content.className = `node-content ${nodeId === activeNeoNodeId ? 'active' : ''}`;

            // Toggler
            if (hasChildren) {
                const toggler = document.createElement('div');
                toggler.className = 'toggler';
                // USE ICON FOR STATE
                toggler.innerHTML = `<i class="fas fa-caret-${isExpanded ? 'down' : 'right'}"></i>`;
                toggler.onclick = (e) => {
                    e.stopPropagation();
                    const isCol = nodeEl.classList.toggle('collapsed');
                    toggler.innerHTML = `<i class="fas fa-caret-${isCol ? 'right' : 'down'}"></i>`;
                };
                content.appendChild(toggler);
            } else {
                const spacer = document.createElement('div');
                spacer.className = 'toggler';
                content.appendChild(spacer);
            }

            // Icon & Label
            content.innerHTML += `
                <i class="${node.icon || 'fas fa-folder'}" style="color:${node.color || 'var(--amber)'}; margin-right: 10px;"></i>
                <span>${node.label || "Névtelen"}</span>
            `;

            content.onclick = () => {
                if (hasChildren) {
                    const toggler = content.querySelector('.toggler');
                    const isCol = nodeEl.classList.toggle('collapsed');
                    if (toggler) toggler.innerHTML = `<i class="fas fa-caret-${isCol ? 'right' : 'down'}"></i>`;
                }

                activeNeoNodeId = nodeId;
                document.querySelectorAll('.node-content').forEach(c => c.classList.remove('active'));
                content.classList.add('active');

                document.getElementById('active-node-title').textContent = node.label;
                document.getElementById('active-node-path').textContent = node.type === 'ELECTRIC' || node.node_type === 'pod' ? 'Villamos fogyasztási hely' : 'Kijelölt mappa';

                if (node.type === 'ELECTRIC' || node.node_type === 'pod') {
                    document.getElementById('add-invoice-btn').style.display = 'inline-block';
                    fetchInvoices(nodeId);
                } else {
                    document.getElementById('add-invoice-btn').style.display = 'none';
                    document.getElementById('invoice-list-container').innerHTML = '<div class="invoice-empty">Válasszon egy fogyasztási helyet a számlák megtekintéséhez.</div>';
                }
            };

            nodeEl.appendChild(content);

            if (hasChildren) {
                const childCont = document.createElement('div');
                childCont.className = 'node-children';
                childCont.style.marginLeft = '1.2rem';
                draw(node.children, childCont, depth + 1, forceShow || matches);
                nodeEl.appendChild(childCont);
            }
            container.appendChild(nodeEl);
        });
    };
    draw(neoNodes, treeContainer);
}

function syncUtilityLocations() {
    const list = document.getElementById('location-list');
    if (!list) return;
    list.innerHTML = '';

    const locations = [];
    const extract = (nodes, path = []) => {
        nodes.forEach(n => {
            if (n.type === 'ELECTRIC') {
                // If it's a POD ID (leaf with type ELECTRIC)
                const address = path[path.length - 1] || "Ismeretlen";
                locations.push({
                    label: n.label,
                    address: address,
                    full: `${address} - ${n.label}`
                });
            } else if (n.children) {
                extract(n.children, [...path, n.label]);
            }
        });
    };
    extract(neoNodes);

    locations.sort((a, b) => a.address.localeCompare(b.address)).forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.full;
        list.appendChild(opt);
    });
}

// Initializations
document.getElementById('neo-tree-search')?.addEventListener('input', (e) => {
    renderNeoTree(e.target.value);
});

window.selectNode = async (id) => {
    activeNeoNodeId = id;
    const node = neoNodes.find(n => n.id === id);
    if (!node) return;

    document.getElementById('active-node-title').textContent = node.label;
    document.getElementById('active-node-path').textContent = node.node_type === 'pod' ? 'Kijelölt fogyasztási hely' : 'Kijelölt mappa';

    document.getElementById('add-invoice-btn').style.display = node.node_type === 'pod' ? 'inline-block' : 'none';
    document.getElementById('neo-entry-container').style.display = 'none';

    document.querySelectorAll('.node-content').forEach(c => c.classList.remove('active'));
    const currentActive = document.querySelector(`#node-${id} > .node-content`);
    if (currentActive) currentActive.classList.add('active');

    fetchInvoices(id);
};

window.openNeoUpload = function (invoiceId) {
    const node = neoNodes.find(n => n.node_type === 'pod' || n.type === 'ELECTRIC'); // Just fallback
    if (!activeNeoNodeId && node) activeNeoNodeId = node.id;

    // Auto-scroll to add form
    document.getElementById('neo-entry-container').style.display = 'block';
    document.getElementById('neo-entry-container').scrollIntoView({ behavior: 'smooth' });
    showToast('Kérlek, töltsd fel az iratot ehhez a tételhez!');
};

// --- UTILS ---
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
});

// NEO Form Logic
const neoForm = document.getElementById('neo-invoice-form');
const addInvBtn = document.getElementById('add-invoice-btn');
const cancelNeoBtn = document.getElementById('cancel-neo-btn');
const neoEntryContainer = document.getElementById('neo-entry-container');

addInvBtn.onclick = () => {
    neoEntryContainer.style.display = 'block';
    neoEntryContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
cancelNeoBtn.onclick = () => {
    neoEntryContainer.style.display = 'none';
    neoForm.reset();
    document.getElementById('neo-file-label').textContent = 'Válassz egy PDF-et...';
};

document.getElementById('neo-file').onchange = (e) => {
    document.getElementById('neo-file-label').textContent = e.target.files[0]?.name || 'Válassz egy PDF-et...';
};

neoForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!activeNeoNodeId) return;

    const btn = neoForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Mentés...';

    const fileInput = document.getElementById('neo-file');
    const file = fileInput.files[0];
    let pdfUrl = null;

    if (file) {
        const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
        const { data, error: uploadError } = await supabaseClient.storage
            .from('neo-documents')
            .upload(fileName, file);

        if (uploadError) {
            showToast('Hiba a PDF feltöltése során: ' + uploadError.message, 'error');
            btn.disabled = false;
            btn.textContent = originalText;
            return; // STOP IF UPLOAD FAILS
        }

        const { data: { publicUrl } } = supabaseClient.storage.from('neo-documents').getPublicUrl(fileName);
        pdfUrl = publicUrl;
    }

    const payload = {
        node_id: activeNeoNodeId,
        provider: document.getElementById('neo-provider').value || 'Ismeretlen',
        invoice_type: document.getElementById('neo-type').value,
        invoice_serial: document.getElementById('neo-serial').value,
        invoice_date: document.getElementById('neo-date').value || new Date().toISOString().split('T')[0],
        amount: parseFloat(document.getElementById('neo-amount').value) || 0,
        currency: document.getElementById('neo-currency').value,
        pdf_url: pdfUrl
    };

    const { error } = await supabaseClient.from('neo_invoices').insert([payload]);
    btn.disabled = false;
    btn.textContent = originalText;

    if (!error) {
        showToast('Irat sikeresen mentve.');
        neoEntryContainer.style.display = 'none';
        neoForm.reset();
        document.getElementById('neo-file-label').textContent = 'Válassz egy PDF-et...';
        fetchInvoices(activeNeoNodeId);
    } else {
        showToast('Hiba: ' + error.message, 'error');
    }
};

// --- SUPABASE & STATE ---
function cell(val) { return val != null && val !== '' && String(val).trim() !== '' ? String(val).trim() : '—'; }

async function fetchInvoices(nodeId) {
    const container = document.getElementById('invoice-list-container');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Adatok betöltése...</div>';

    try {
        const { data, error } = await supabaseClient.from('neo_invoices')
            .select('*')
            .eq('node_id', nodeId)
            .order('invoice_date', { ascending: false });

        if (error) throw error;

        currentInvoices = data || [];
        renderInvoices(currentInvoices);

    } catch (err) {
        showToast('Hiba a lekérés során: ' + err.message, 'error');
        container.innerHTML = '<div class="invoice-empty">Hiba történt az adatok betöltésekor.</div>';
    }
}

function renderInvoices(data) {
    const container = document.getElementById('invoice-list-container');
    const topScroll = document.getElementById('neo-top-scroll');
    const topScrollContent = document.getElementById('neo-top-scroll-content');

    if (data?.length) {
        container.innerHTML = `
            <div class="invoice-table-wrap" id="invoice-table-scroll-container">
                <table class="premium-table invoice-table" id="main-invoice-table">
                    <thead>
                        <tr>
                            <th>DÁTUM</th>
                            <th>SZOLGÁLTATÓ</th>
                            <th>SORSZÁM</th>
                            <th>ÖSSZEG</th>
                            <th>VEVŐ</th>
                            <th>FOGY. CÍM</th>
                            <th>POD</th>
                            <th>MÉRŐÓRA</th>
                            <th style="text-align:center;">MEGTEKINTÉS</th>
                            <th style="text-align:center;">LETÖLTÉS</th>
                            <th style="text-align:center;">TÖRLÉS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(inv => {
            const url = inv.pdf_url || '';
            const hasFile = url && url.length > 5; // More robust check

            const viewBtn = hasFile
                ? `<button onclick="window.previewPdf('${url}')" class="btn-table btn-view" title="Betekintés megnyitása"><i class="fas fa-eye"></i></button>`
                : `<button onclick="window.openNeoUpload('${inv.id}')" class="btn-table btn-view secondary" title="Fájl pótlása / Feltöltés"><i class="fas fa-upload"></i></button>`;

            const dlBtn = hasFile
                ? `<a href="${url}" download target="_blank" class="btn-table btn-dl" title="Fájl letöltése"><i class="fas fa-download"></i></a>`
                : `<button class="btn-table disabled" title="Nincs bizonylat"><i class="fas fa-ban"></i></button>`;

            const formatDate = (d) => {
                if (!d || d === '—') return '—';
                const parts = d.split('-');
                if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}.`;
                return d;
            };

            return `<tr>
                                    <td class="cell-date">${formatDate(inv.invoice_date)}</td>
                                    <td>${cell(inv.provider)}</td>
                                    <td>${cell(inv.invoice_serial)}</td>
                                    <td><strong>${inv.amount != null ? inv.amount.toLocaleString('hu-HU') + ' ' + (inv.currency || 'Ft') : '—'}</strong></td>
                                    <td class="cell-optional">${cell(inv.buyer_name)}</td>
                                    <td class="cell-optional" style="min-width: 250px;">${cell(inv.consumption_address)}</td>
                                    <td class="cell-optional">${cell(inv.pod_id)}</td>
                                    <td class="cell-optional">${cell(inv.meter_serial)}</td>
                                    <td style="text-align:center;">${viewBtn}</td>
                                    <td style="text-align:center;">${dlBtn}</td>
                                    <td style="text-align:center;">
                                        <button onclick="window.deleteInvoice('${inv.id}')" class="btn-table btn-delete" title="Irat törlése" style="background:rgba(255,82,82,0.1); color:#ff5252; border:1px solid rgba(255,82,82,0.3);">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>`;
        }).join('')}
                    </tbody>
                </table>
            </div>`;

        // Wait for DOM update to sync scrollbars (longer timeout for precise measurement)
        setTimeout(() => {
            const tableWrap = document.getElementById('invoice-table-scroll-container');
            const table = document.getElementById('main-invoice-table');

            if (!tableWrap || !table || !topScroll || !topScrollContent) return;

            const hasOverflow = table.scrollWidth > tableWrap.clientWidth;
            console.log('Scroll sync debug:', { sw: table.scrollWidth, cw: tableWrap.clientWidth, hasOverflow });

            if (hasOverflow) {
                topScroll.style.display = 'block';
                topScrollContent.style.width = table.scrollWidth + 'px';
                console.log('Activating top scroll:', table.scrollWidth);

                // Re-sync scroll positions
                topScroll.scrollLeft = tableWrap.scrollLeft;

                // Precision Sync Logic
                let isSyncing = false;
                topScroll.onscroll = function () {
                    if (!isSyncing) {
                        isSyncing = true;
                        tableWrap.scrollLeft = topScroll.scrollLeft;
                        setTimeout(() => isSyncing = false, 5);
                    }
                };
                tableWrap.onscroll = function () {
                    if (!isSyncing) {
                        isSyncing = true;
                        topScroll.scrollLeft = tableWrap.scrollLeft;
                        setTimeout(() => isSyncing = false, 5);
                    }
                };
            } else {
                topScroll.style.display = 'none';
            }
        }, 300); // 300ms for stable layout

    } else {
        topScroll.style.display = 'none';
        container.innerHTML = '<div class="invoice-empty">Nincs találat vagy a mappa üres.</div>';
    }
}

window.filterInvoices = function () {
    const query = document.getElementById('invoice-search').value.toLowerCase().trim();
    if (!query) {
        renderInvoices(currentInvoices);
        return;
    }

    const filtered = currentInvoices.filter(inv => {
        return (
            (inv.invoice_date || '').toLowerCase().includes(query) ||
            (inv.provider || '').toLowerCase().includes(query) ||
            (inv.invoice_serial || '').toLowerCase().includes(query) ||
            String(inv.amount || '').includes(query) ||
            (inv.buyer_name || '').toLowerCase().includes(query) ||
            (inv.consumption_address || '').toLowerCase().includes(query) ||
            (inv.pod_id || '').toLowerCase().includes(query) ||
            (inv.meter_serial || '').toLowerCase().includes(query)
        );
    });

    renderInvoices(filtered);
};

// --- PDF MODAL CONTROLS ---
window.previewPdf = function (url) {
    if (!url || url === 'undefined' || url === 'null') {
        showToast('Nincs érvényes fájl link ehhez a tételhez.', 'error');
        return;
    }
    const modal = document.getElementById('pdf-modal');
    const viewer = document.getElementById('pdf-viewer');
    const dlLink = document.getElementById('pdf-download-link');

    if (!modal || !viewer) {
        console.error('PDF Modal elements missing');
        return;
    }

    // Set interactive visual feedback
    viewer.src = ''; // Clear previous
    setTimeout(() => {
        viewer.src = url;
    }, 10);

    if (dlLink) dlLink.href = url;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closePdfModal = function () {
    const modal = document.getElementById('pdf-modal');
    const viewer = document.getElementById('pdf-viewer');

    viewer.src = '';
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

// --- OCR ENGINE (VALÓDI SZÖVEGALAPÚ KIVONATOLÁS) ---
const ocrBtn = document.getElementById('process-ocr-btn');
const ocrResults = document.getElementById('ocr-results');
const ocrFileInput = document.getElementById('ocr-file');

if (ocrFileInput) {
    ocrFileInput.onchange = (e) => updateOcrLabel(e.target.files);
    const dropZone = document.querySelector('.ocr-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length) {
                ocrFileInput.files = files;
                updateOcrLabel(files);
            }
        });
    }
}
function updateOcrLabel(files) {
    const lbl = document.getElementById('ocr-label');
    if (!lbl) return;
    if (!files || files.length === 0) lbl.textContent = 'Húzza ide a PDF/kép fájl(oka)t vagy kattintson a tallózáshoz';
    else if (files.length > 1) lbl.textContent = `${files.length} fájl kiválasztva`;
    else lbl.textContent = files[0]?.name || 'Fájl kiválasztva';
}

// --- Szövegkivonatoló függvények ---

async function extractTextFromPdf(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) throw new Error('PDF.js nem töltődött be');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const pageTexts = [];
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageStr = content.items.map(item => item.str).join(' ');
        pageTexts.push(pageStr.trim());
    }
    const extractedText = pageTexts.map((s, idx) => `--- Oldal ${idx + 1} / ${numPages} ---\n${s}`).join('\n\n');

    // Ha kevés szöveg van (képalapú PDF?), akkor OCR-t használunk
    if (extractedText.trim().length < 200) {
        console.log('Kevés szöveg kinyerve, OCR használata PDF oldalakon...');
        const ocrTexts = [];
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 2.0 }); // Magasabb felbontás az OCR-hez
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const ocrResult = await Tesseract.recognize(blob, 'hun+eng', { logger: () => { } });
            ocrTexts.push(ocrResult.data.text.trim());
        }
        return ocrTexts.map((s, idx) => `--- Oldal ${idx + 1} / ${numPages} (OCR) ---\n${s}`).join('\n\n');
    }

    return extractedText;
}

async function extractTextFromImage(file) {
    if (typeof Tesseract === 'undefined') throw new Error('Tesseract.js nem töltődött be');
    const result = await Tesseract.recognize(file, 'hun+eng', {
        logger: () => { }
    });
    return result.data.text.trim();
}

// --- NER elemző: fő paraméterek kiolvasása számlákból ---
function analyzeText(text, fileName) {
    // Szöveg normalizálás: többszörös space-eket egyetlenre, sortöréseket space-re
    let t = text.replace(/\s+/g, ' ').trim();

    // ---- Szám parse: Magyar formátum (pont=ezres, vessző=tizedes) és ELMŰ pont=ezres (14.053) ----
    const parseNum = (s) => {
        if (!s) return 0;
        let raw = (s + '').trim().replace(/\s/g, '');
        // 292.486,00 -> Magyar: pont ezres, vessző tizedes
        if (/\d\.\d{3},\d/.test(raw)) {
            raw = raw.replace(/\./g, '').replace(',', '.');
            // 14.053 -> pont ezres elválasztó (3 tizedesjegy után nincs tizedes)
        } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
            raw = raw.replace(/\./g, '');
            // 292.486 -> szintén ezres
        } else if (/\d\.\d{3}$/.test(raw)) {
            raw = raw.replace(/\./g, '');
            // 1.234,56 form
        } else if (/\d,\d{3}\./.test(raw)) {
            raw = raw.replace(/,/g, '');
        } else {
            raw = raw.replace(',', '.');
        }
        return parseFloat(raw) || 0;
    };

    const toYMD = (yr, mo, dy) => {
        if (!yr || parseInt(yr) < 2000 || parseInt(yr) > 2030) return null;
        // Ha mo szöveges hónap, konvertáljuk számmá
        const monthMap = {
            'január': '01', 'február': '02', 'március': '03', 'április': '04', 'május': '05', 'június': '06',
            'július': '07', 'augusztus': '08', 'szeptember': '09', 'október': '10', 'november': '11', 'december': '12',
            'jan': '01', 'feb': '02', 'már': '03', 'ápr': '04', 'máj': '05', 'jún': '06',
            'júl': '07', 'aug': '08', 'szept': '09', 'okt': '10', 'nov': '11', 'dec': '12'
        };
        if (typeof mo === 'string' && monthMap[mo.toLowerCase()]) {
            mo = monthMap[mo.toLowerCase()];
        }
        return `${yr}-${(mo || '01').padStart(2, '0')}-${(dy || '01').padStart(2, '0')}`;
    };

    // Formáz pozitív VAGY negatív számot Ft-ban
    const fmtNum = (v) => {
        if (v === 0 || v === null || v === undefined || isNaN(v)) return '';
        return Math.round(v).toLocaleString('hu-HU') + ' Ft';
    };

    // ---- FIZETENDŐ ÖSSZEG – pontosan a tényleges befizetendő ----
    // Számlánkénti prioritás:
    // 1. "Fizetendő összeg összesen NNN" (MVM Next elszámoló)
    // 2. "Fizetendő összeg: NNN Ft" (MVM Next részszámla fejlécből)
    // 3. "Fizetendő összesen NNN" (ELMŰ-ÉMÁSZ)
    // 4. "Bruttó számlaérték összesen"
    // 5. Fallback: bármilyen Ft összeg
    let amount = 0;
    let currency = 'Ft';
    let isNegativeAmount = false;

    // Negatív összeg kezelése (visszatérítés/jóváírás)
    const negM = t.match(/fizetend[oő]\s*(?:összeg)?\s*(?:összesen)?[:\s]+(-\s*[\d\s.,]+)\s*Ft/i);
    if (negM) {
        const v = parseNum(negM[1].replace(/\s/g, '').replace('-', ''));
        if (v > 0) { amount = -v; isNegativeAmount = true; }
    }

    if (!isNegativeAmount) {
        // Keresünk "Fizetendő összeg összesen NNN" sort (MVM Next, táblázat vége)
        const fizetoM1 = t.match(/fizetend[oő]\s+összeg\s+összesen\s+([\d\s.,]+)/i);
        const fizetoM2 = t.match(/fizetend[oő]\s*összeg\s*[:\s]+([\d\s.,]+)\s*Ft/i);
        const fizetoM3 = t.match(/fizetend[oő]\s+összesen\s+([\d\s.,]+)/i);
        const bruttoM = t.match(/bruttó\s+sz[aá]mla[eé]rt[eé]k\s+összesen[^:\d\-]{0,10}([\d\s.,]+)/i);

        for (const m of [fizetoM1, fizetoM2, fizetoM3, bruttoM]) {
            if (m) {
                const v = parseNum(m[1]);
                if (v > 50) { amount = v; break; }
            }
        }
    }

    // Fallback: legnagyobb Ft összeg a szövegben
    if (amount === 0) {
        const ftAll = [...t.matchAll(/([\d][\d\s.,]{2,})\s*Ft/gi)];
        let best = 0;
        for (const m of ftAll) {
            const v = parseNum(m[1]);
            if (v > best && v < 100000000) best = v;
        }
        if (best > 0) amount = best;
    }

    // ---- SZÁMLA DÁTUMA ----
    let date = new Date().toISOString().split('T')[0];
    const datePatterns = [
        /sz[aá]mla\s+kelte[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i,
        /kelte?\s*[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i,
        /sz[aá]mla\s+kelte[:\s]+(\d{4})\.(\d{2})\.(\d{2})/i,
        /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/,
        /sz[aá]mla\s+kelte[:\s]+(\d{1,2})\.\s*([a-záéíóöőúüű]+)\s*(\d{4})/i,
        /(\d{1,2})\.\s*([a-záéíóöőúüű]+)\s*(\d{4})/i,
        /(\d{4})\s+([a-záéíóöőúüű]+)\s+(\d{1,2})/i,
    ];
    for (const pat of datePatterns) {
        const m = pat.exec(t);
        if (m && m[1]) {
            let yr, mo, dy;
            if (pat.source.includes('([a-záéíóöőúüű]+)')) {
                // Szöveges hónap: m[1] nap, m[2] hónap, m[3] év vagy m[1] év, m[2] hónap, m[3] nap
                if (m[1].length === 4) { // év hónap nap
                    yr = m[1]; mo = m[2]; dy = m[3];
                } else { // nap hónap év
                    dy = m[1]; mo = m[2]; yr = m[3];
                }
            } else {
                yr = m[1]; mo = m[2]; dy = m[3];
            }
            const d = toYMD(yr, mo, dy);
            if (d) { date = d; break; }
        }
    }

    // ---- FIZETÉSI HATÁRIDŐ ----
    let dueDate = '';
    const duePatterns = [
        /fizet[eé]si\s*hat[aá]rid[oőõ][^:\d]{0,5}[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i,
        /hat[aá]rid[oőõ][^:\d]{0,10}[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i,
        /fizet[eé]si\s*hat[aá]rid[oőõ][^:\d]{0,5}[:\s]+(\d{1,2})\.\s*([a-záéíóöőúüű]+)\s*(\d{4})/i,
        /hat[aá]rid[oőõ][^:\d]{0,10}[:\s]+(\d{1,2})\.\s*([a-záéíóöőúüű]+)\s*(\d{4})/i,
        /fizet[eé]si\s*hat[aá]rid[oőõ][^:\d]{0,5}[:\s]+(\d{4})\s+([a-záéíóöőúüű]+)\s+(\d{1,2})/i,
    ];
    for (const pat of duePatterns) {
        const m = pat.exec(t);
        if (m) {
            let yr, mo, dy;
            if (pat.source.includes('([a-záéíóöőúüű]+)')) {
                if (m[1].length === 4) {
                    yr = m[1]; mo = m[2]; dy = m[3];
                } else {
                    dy = m[1]; mo = m[2]; yr = m[3];
                }
            } else {
                yr = m[1]; mo = m[2]; dy = m[3];
            }
            const d = toYMD(yr, mo, dy);
            if (d) { dueDate = d; break; }
        }
    }

    // ---- ELSZÁMOLÁSI IDŐSZAK ----
    let billingPeriod = '';
    // MVM Next: "Elszámolási időszak: 2022.08.01.-2023.01.09."
    // ELMŰ: "2019.11.01-2019.11.30" a sorokból
    const periodM = t.match(/(?:elsz[aá]mol[aá]si|elsz[aá]molt)\s*id[oő]szak[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})\.?\s*[-–]\s*(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i)
        || t.match(/id[oő]szak[:\s]+(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})\.?\s*[-–]\s*(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/i)
        || t.match(/(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})\.?\s*[-–]\s*(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
    if (periodM) {
        billingPeriod = `${periodM[1]}.${periodM[2].padStart(2, '0')}.${periodM[3].padStart(2, '0')} – ${periodM[4]}.${periodM[5].padStart(2, '0')}.${periodM[6].padStart(2, '0')}`;
    }

    // ---- SORSZÁM ----
    let serial = '';
    const serialPatterns = [
        /sz[aá]mla\s+sorssz[aá]ma[:\s]+(\d{9,15})/i,
        /sz[aá]mla\s+sorsz[aá]ma[:\s]+(\d{9,15})/i,
        /sorsz[aá]m(?:a)?\s*[:\s]+(\d{9,15})/i,
        /sorsz[aá]m(?:a)?\s*[:\s]+([A-Z0-9]{6,30})/i,
        /([89]\d{11,14})/,  // ELMŰ 830000... típusú
        /(\d{12,15})/,      // MVM Next 101... típusú
    ];
    for (const pat of serialPatterns) {
        const m = pat.exec(t);
        if (m) {
            const candidate = m[1].trim();
            if (candidate.length >= 6 && !/^\d{8}-\d-\d{2}$/.test(candidate)) {
                serial = candidate;
                if (serial.length >= 6) break;
            }
        }
    }

    // ---- SZOLGÁLTATÓ ----
    let provider = '';
    const providerPatterns = [
        { re: /MVM\s+Next/i, name: 'MVM Next Energiakereskedelmi Zrt.' },
        { re: /ELMŰ[\s\-]*ÉMÁSZ/i, name: 'ELMŰ-ÉMÁSZ Energiakereskedő Kft.' },
        { re: /ELMŰ/i, name: 'ELMŰ Hálózati Kft.' },
        { re: /ÉMÁSZ/i, name: 'ÉMÁSZ Zrt.' },
        { re: /E\.ON\s+Next/i, name: 'E.ON Next Kft.' },
        { re: /E\.ON\s+Hung[aá]ria/i, name: 'E.ON Hungária Zrt.' },
        { re: /E\.ON/i, name: 'E.ON Hungária Zrt.' },
        { re: /MVM/i, name: 'MVM Zrt.' },
        { re: /NKM\s+Energia/i, name: 'NKM Energia Zrt.' },
        { re: /NKM/i, name: 'NKM Zrt.' },
        { re: /FŐGÁZ/i, name: 'FŐGÁZ Zrt.' },
        { re: /TIGÁZ/i, name: 'TIGÁZ Zrt.' },
        { re: /EDF/i, name: 'EDF DÉMÁSZ Zrt.' },
        { re: /DÉDÁSZ/i, name: 'DÉDÁSZ Zrt.' },
        { re: /DÉMÁSZ/i, name: 'DÉMÁSZ Zrt.' },
        { re: /RWE/i, name: 'RWE Hungária Kft.' },
        { re: /ALTEO/i, name: 'ALTEO Energiaszolgáltató Nyrt.' },
        { re: /GDF\s+Suez/i, name: 'GDF Suez Energia Magyarország Zrt.' },
        { re: /PANNON/i, name: 'Pannon Energia Zrt.' },
        { re: /DUNA/i, name: 'Duna Aszfalt Kft.' },  // Ha van ilyen
    ];
    for (const p of providerPatterns) {
        if (p.re.test(t)) { provider = p.name; break; }
    }
    if (!provider) {
        const cm = t.match(/([A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű\s\-]{2,35}(?:Zrt\.|Kft\.|Bt\.|Rt\.))/);
        if (cm) provider = cm[1].trim();
    }
    if (!provider) provider = 'Ismeretlen';

    // ---- DOKUMENTUM TÍPUS ----
    let type = 'Általános Dokumentum';
    const score = { gas: 0, elec: 0, water: 0, contract: 0, invoice: 0 };
    if (/f[oö]ldg[aá]z|g[aá]zsz[aá]mla|g[aá]zszolg[aá]ltat|m[³3]|MJ\b|gázdíj/i.test(t)) score.gas += 3;
    if (/villamos|elektromos|kwh|áramszolg[aá]ltat|villany/i.test(t)) score.elec += 3;
    if (/víz|ivóvíz|csatorna|m[³3]|v[ií]zm[uű]/i.test(t)) score.water += 3;
    if (/h[oő]mennyis[eé]g|t[aá]vh[oő]|GJ\b/i.test(t)) score.heat = (score.heat || 0) + 3;
    if (/r[eé]szsz[aá]mla/i.test(t)) score.invoice += 1;
    if (/elsz[aá]mol[oó]\s*sz[aá]mla/i.test(t)) score.invoice += 2;
    if (/sz[aá]mla/i.test(t)) score.invoice += 1;
    if (/szerz[oő]d[eé]s/i.test(t)) score.contract += 2;
    const fn = fileName.toLowerCase();
    if (/g[aá]z|gas|mvm/.test(fn)) score.gas++;
    if (/villany|elec|aram|nkm/.test(fn)) score.elec++;
    const topType = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    if (topType[1] > 0) {
        const isElszamolo = /elsz[aá]mol[oó]\s*sz[aá]mla/i.test(t);
        const isRessz = /r[eé]szsz[aá]mla/i.test(t);
        if (topType[0] === 'gas') type = isElszamolo ? 'Földgáz Elszámoló Számla' : isRessz ? 'Földgáz Részszámla' : 'Földgáz Számla';
        else if (topType[0] === 'elec') type = 'Villamos Energia Számla';
        else if (topType[0] === 'water') type = 'Víz Számla';
        else if (topType[0] === 'contract') type = 'Szerződés';
        else type = 'Számla';
    }

    // ---- ADÓSZÁM (vevőé, nem a szolgáltatóé preferáltan) ----
    let taxId = '';
    // Vevő adószáma prioritás
    const buyerTaxM = t.match(/(?:vev[oő]|fizet[oő]).*?adósz[aá]m[:\s]+(\d{8}[-\s]?\d[-\s]?\d{2})/i);
    if (buyerTaxM) {
        taxId = buyerTaxM[1].trim();
    } else {
        const taxM = t.match(/adósz[aá]m[:\s]+(\d{8}[-\s]?\d[-\s]?\d{2})/i);
        if (taxM) taxId = taxM[1].trim();
    }

    // ---- MÉRŐÁLLÁSOK – MVM Next és ELMŰ-ÉMÁSZ formátum ----
    // MVM Next táblázat: "Induló mérőállás ... Záró mérőállás ... Fogyasztás (m3)"
    // A PDF szövegkivonatolás a táblázat sorát mint számsorozatot adja vissza
    // Keresünk: "Záró mérőállás" és "Induló mérőállás" felirat után
    let meterReadingCurrent = '';  // záró/utolsó
    let meterReadingPrev = '';  // induló/előző
    let meterReadingDelta = '';  // különbség

    // ELMŰ-ÉMÁSZ: "Mérőállás előző" / "Mérőállás utolsó" explicit oszlopok
    const elmuPrevM = t.match(/m[eé]r[oő][aá]ll[aá]s\s+el[oő]z[oő][:\s]+([\d\s.,]+)/i)
        || t.match(/el[oő]z[oő]\s+m[eé]r[oő][aá]ll[aá]s[:\s]+([\d\s.,]+)/i);
    const elmuCurrM = t.match(/m[eé]r[oő][aá]ll[aá]s\s+utols[oó][:\s]+([\d\s.,]+)/i)
        || t.match(/utols[oó]\s+m[eé]r[oő][aá]ll[aá]s[:\s]+([\d\s.,]+)/i);

    // ELMŰ-ÉMÁSZ táblázatban: "35510... 2019.11.01-2019.11.30  4.013  7.890  01  1,026800  3.981  141.674"
    // Gázmérő azonosító sor után: id | időszak | előző | utolsó | LM | korr | fogyasztás | hőmenny
    const elmuRowM = t.match(/\d{14,17}\s+\d{4}[.\-]\d{2}[.\-]\d{2}[-–]\d{4}[.\-]\d{2}[.\-]\d{2}\s+([\d.,]+)\s+([\d.,]+)\s+\d{2}/);
    if (elmuRowM) {
        const p = parseNum(elmuRowM[1]);
        const c = parseNum(elmuRowM[2]);
        if (p > 0) meterReadingPrev = p.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
        if (c > 0) meterReadingCurrent = c.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
    } else if (elmuPrevM && elmuCurrM) {
        const p = parseNum(elmuPrevM[1]);
        const c = parseNum(elmuCurrM[1]);
        if (p > 0) meterReadingPrev = p.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
        if (c > 0) meterReadingCurrent = c.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
    }

    // MVM Next: "Induló mérőállás" / "Záró mérőállás" oszlopfejlécek + táblasor
    // A kinyert szövegben: "gyártási időszak mérőállás mérőállás (m3) ... 32 681 33 799 Becs 1 118"
    if (!meterReadingCurrent) {
        // Záró mérőállás explicit
        const zaroM = t.match(/z[aá]r[oó]\s+m[eé]r[oő][aá]ll[aá]s[:\s]+([\d\s.,]+)/i);
        const indM = t.match(/indul[oó]\s+m[eé]r[oő][aá]ll[aá]s[:\s]+([\d\s.,]+)/i);
        if (zaroM) { const v = parseNum(zaroM[1]); if (v > 0) meterReadingCurrent = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }); }
        if (indM) { const v = parseNum(indM[1]); if (v > 0) meterReadingPrev = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }); }
    }

    // MVM Next részszámla: csak "Utolsó elszámolt mérőállás" leolvasásának dátuma + érték
    // "2022.01.03.  6 063"
    let lastSettledReading = '';
    const lastSettledM = t.match(/utols[oó]\s+elsz[aá]molt\s+m[eé]r[oő][aá]ll[aá]s\s*(?:leolvas[aá]s[aá]nak\s*d[aá]tuma\s*\(m[³3]\))?\s*([\d\s.,]+)/i)
        || t.match(/utols[oó]\s+elsz[aá]molt\s+m[eé]r[oő][aá]ll[aá]s\s*\(m[³3]\)\s*([\d\s.,]+)/i);
    if (lastSettledM) {
        const v = parseNum(lastSettledM[1]);
        if (v > 0) lastSettledReading = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' m³';
    }
    // Ha nincs explicit záró állás de van "utolsó elszámolt", azt használjuk referenciaként
    if (!meterReadingCurrent && !meterReadingPrev && lastSettledReading) {
        meterReadingPrev = lastSettledReading.replace(' m³', '');
    }

    // MVM Next elszámoló több időszak: keresünk utolsó mérőállás értéket (legmagasabb záró)
    if (!meterReadingCurrent && !meterReadingPrev) {
        // "33 799 34 580 Leol 781" - típusú sorokat keresünk (páros számok + LM típus)
        const mvmRows = [...t.matchAll(/([\d\s]{4,10})\s+([\d\s]{4,10})\s+(?:Becs|Leol|Dikt|Ell)\s+([\d\s.,]+)/gi)];
        if (mvmRows.length > 0) {
            const firstRow = mvmRows[0];
            const lastRow = mvmRows[mvmRows.length - 1];
            const p = parseNum(firstRow[1]);
            const c = parseNum(lastRow[2]);
            if (p > 0) meterReadingPrev = p.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
            if (c > 0) meterReadingCurrent = c.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
        }
    }

    // Delta számítás
    if (meterReadingCurrent && meterReadingPrev) {
        const curr = parseNum(meterReadingCurrent.replace(/\s/g, '').replace(/\./g, ''));
        const prev = parseNum(meterReadingPrev.replace(/\s/g, '').replace(/\./g, ''));
        if (curr > 0 && prev > 0 && curr > prev) {
            const delta = curr - prev;
            meterReadingDelta = delta.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' m³';
        }
    }

    // ---- FOGYASZTÁS m³ és kWh ----
    let consumption = '-';
    let consumptionM3 = '';
    let consumptionKwh = '';
    let consumptionMJ = '';

    // "Elszámolt mennyiség: 7 242 MJ (204,00 m3)"
    const elszamoltM = t.match(/elsz[aá]molt\s+mennyis[eé]g[:\s]+([\d\s.,]+)\s*MJ\s*\(([\d\s.,]+)\s*m[³3]\)/i);
    if (elszamoltM) {
        const mj = parseNum(elszamoltM[1]);
        const m3 = parseNum(elszamoltM[2]);
        if (mj > 0) consumptionMJ = mj.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' MJ';
        if (m3 > 0) consumptionM3 = m3.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' m³';
    }

    // ELMŰ-ÉMÁSZ: "Elszámolt hőmennyiség MJ: 141.674" – a táblasor végén
    if (!consumptionMJ) {
        const elmuMJm = t.match(/elsz[aá]molt\s+h[oő]mennyis[eé]g\s*MJ\s*([\d\s.,]+)/i)
            || t.match(/([\d.,]+)\s*MJ\b/i);
        if (elmuMJm) { const v = parseNum(elmuMJm[1]); if (v > 100) consumptionMJ = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' MJ'; }
    }

    // Fogyasztás nm3 (ELMŰ: "Fogyasztás nm3: 3.981")
    if (!consumptionM3) {
        const nm3M = t.match(/fogyaszt[aá]s\s*nm[³3]?\s*([\d\s.,]+)/i)
            || t.match(/([\d.,]+)\s*nm[³3]/i);
        if (nm3M) { const v = parseNum(nm3M[1]); if (v > 0 && v < 1000000) consumptionM3 = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' m³'; }
    }

    // Általános fogyasztás keresés: "Fogyasztás: 123 m³" vagy "Mennyiség: 456 MJ"
    if (!consumptionM3) {
        const consM3M = t.match(/fogyaszt[aá]s[:\s]+([\d\s.,]+)\s*m[³3]/i)
            || t.match(/mennyis[eé]g[:\s]+([\d\s.,]+)\s*m[³3]/i);
        if (consM3M) { const v = parseNum(consM3M[1]); if (v > 0) consumptionM3 = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' m³'; }
    }
    if (!consumptionMJ) {
        const consMJM = t.match(/fogyaszt[aá]s[:\s]+([\d\s.,]+)\s*MJ/i)
            || t.match(/mennyis[eé]g[:\s]+([\d\s.,]+)\s*MJ/i);
        if (consMJM) { const v = parseNum(consMJM[1]); if (v > 0) consumptionMJ = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' MJ'; }
    }
    if (!consumptionKwh) {
        const consKwhM = t.match(/fogyaszt[aá]s[:\s]+([\d\s.,]+)\s*kWh/i)
            || t.match(/mennyis[eé]g[:\s]+([\d\s.,]+)\s*kWh/i);
        if (consKwhM) { const v = parseNum(consKwhM[1]); if (v > 0) consumptionKwh = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' kWh'; }
    }

    // kWh fogyasztás (biztonsági díjnál jelenik meg)
    const kwhM = t.match(/bizttons[aá]gi\s+k[eé]szletez[eé]si\s+d[ií]j.*?([\d\s.,]+)\s*kWh/i)
        || t.match(/([\d\s.,]+)\s*kWh/i);
    if (kwhM) { const v = parseNum(kwhM[1]); if (v > 0 && v < 10000000) consumptionKwh = v.toLocaleString('hu-HU', { maximumFractionDigits: 3 }) + ' kWh'; }

    // Összeállítás
    const consParts = [];
    if (consumptionM3) consParts.push(consumptionM3);
    if (consumptionMJ) consParts.push(consumptionMJ);
    if (consumptionKwh) consParts.push(consumptionKwh);
    if (consParts.length > 0) consumption = consParts.join(' + ');
    else if (meterReadingDelta) consumption = meterReadingDelta;

    // ---- MÉRŐÓRA GYÁRI SZÁMA ----
    let meterSerial = '';
    // ELMŰ-ÉMÁSZ: "Gázmérő azonosító: 35510908208609"
    const elmuMeterM = t.match(/g[aá]zm[eé]r[oő]\s+azonos[ií]t[oó]\s*([\d\-]{10,25})/i);
    // MVM Next: "695511935198-279" vagy "312401431348-203" formátum (gyártási szám)
    const mvmMeterM = t.match(/gy[aá]rt[aá]si\s+sz[aá]m[a]?\s*\n?\s*([\d\-]{10,25})/i)
        || t.match(/(\d{12,15}[-–]\d{1,5})/);  // MVM mérőszám formátum: 12+ digit - 1-5 digit

    if (elmuMeterM) meterSerial = elmuMeterM[1].replace(/\s/g, '');
    else if (mvmMeterM) meterSerial = mvmMeterM[1].trim();

    // Általános keresés hosszú számsorokra, ha nincs specifikus találat
    if (!meterSerial) {
        const longNumbers = [...t.matchAll(/(\d{10,25})/g)];
        for (const m of longNumbers) {
            const num = m[1];
            // Kizárjuk, ha adószám, sorozatszám vagy Ft összeg formátum
            if (!/^\d{8}-\d-\d{2}$/.test(num) && !/^\d{9,15}$/.test(num) && !/\d{1,10}\s*Ft/.test(num)) {
                meterSerial = num;
                break;  // Az első megfelelő hosszú számot vesszük
            }
        }
    }

    // Kizárjuk adószám formátumot
    if (meterSerial && /^\d{8}-\d-\d{2}$/.test(meterSerial)) meterSerial = '';

    // ---- POD azonosító ----
    let podId = '';
    const podM = t.match(/POD\s+azonosítója?\s*[:\s]+([A-Z0-9]{10,30})/i)
        || t.match(/POD[:\s]+([A-Z0-9]{10,30})/i)
        || t.match(/m[eé]r[eé]si\s*pont\s*azonosít[oó][:\s]+([A-Z0-9]{10,30})/i);
    if (podM) podId = podM[1].replace(/\s/g, '').trim().substring(0, 50);

    // ---- VEVŐ NEVE ----
    let buyerName = '';
    const buyerM = t.match(/vev[oő]\s*(?:\(fizet[oő]\))?\s*neve?[:\s]+([^:]{5,80}?)(?=\s+(?:cím|adószám|felhasznál|elsz|szolgáltató))/i)
        || t.match(/felhasznál[oó]\s+neve[:\s]+([^:]{5,80}?)(?=\s+(?:cím|adószám|felhasznál|elsz|szolgáltató))/i);
    if (buyerM) buyerName = buyerM[1].replace(/\s+/g, ' ').trim().substring(0, 100);

    // ---- FOGYASZTÁSI / FELHASZNÁLÁSI CÍM ----
    let consumptionAddress = '';
    const addrM = t.match(/felhasznál[aá]si\s+hely\s+c[ií]me?[:\s]+(7500[^:]{5,80}?)(?=\s+(?:elsz[aá]mol|adószám|pod|szolgáltató))/i)
        || t.match(/felhasznál[aá]si\s+hely[:\s]+(7500[^:]{5,80}?)(?=\s+(?:elsz[aá]mol|adószám|pod|szolgáltató))/i)
        || t.match(/(7500\s+Nagyat[aá]d[^:]{3,80}?)(?=\s+(?:elsz[aá]mol|adószám|pod|szolgáltató))/i);
    if (addrM) consumptionAddress = addrM[1].replace(/\s+/g, ' ').trim().substring(0, 120);

    // ---- NETTÓ ÖSSZEG ----
    let netAmount = '';
    // "Nettó számlaérték összesen  25 328  27" – a 27 ÁFA% az utolsó szám az összeg után
    const netPatterns = [
        /nett[oő]\s+sz[aá]mla[eé]rt[eé]k\s+összesen\s+([-\d][\d\s.,]+?)(?:\s+27|\s+Ft|$)/im,
        /sz[aá]mla[eé]rt[eé]k\s+összesen\s+([-\d][\d\s.,]+?)(?:\s+\d+\.\d{3}|\s+Ft|\n)/im,
        /nett[oő]\s+[eé]rt[eé]k\s+összesen?\s+([-\d][\d\s.,]+?)(?:\s+\d{2,3}|\s+Ft)/im,
        /nett[oő]\s+[oő]sszeg[:\s]+([-\d][\d\s.,]+?)(?:\s+Ft|\n)/i,
        /nett[oő][^:\d]{0,25}[:\s]+([-\d][\d\s.,]+?)\s*Ft/i,
        /nett[oő]\s+alap[:\s]+([-\d][\d\s.,]+?)\s*Ft/i,
        /nett[oő]\s+sz[aá]mla[eé]rt[eé]k[:\s]+([-\d][\d\s.,]+?)\s*Ft/i,
    ];
    for (const pat of netPatterns) {
        const m = t.match(pat);
        if (m) {
            const neg = m[1].trim().startsWith('-');
            const v = parseNum(m[1].trim().replace(/^-\s*/, ''));
            if (v > 0) { netAmount = (neg ? '-' : '') + Math.round(v).toLocaleString('hu-HU') + ' Ft'; break; }
        }
    }

    // ---- ÁFA ÖSSZEG ----
    let vatAmount = '';
    // "ÁFA összesítő (Ft)  ÁFA (%)  Nettó érték (Ft)  ÁFA (Ft)  Bruttó érték (Ft)"
    // "27  25 328  6 839  32 167"
    const vatSummaryM = t.match(/[aá]fa\s*\(%\)\s+nett[oő]\s+[eé]rt[eé]k.*?(\d+)\s+([-\d][\d\s.,]+)\s+([-\d][\d\s.,]+)\s+([-\d][\d\s.,]+)/is)
        || t.match(/[aá]fa\s+[oő]sszeg[ií]t[oő].*?(\d+)\s+([-\d][\d\s.,]+)\s+([-\d][\d\s.,]+)\s+([-\d][\d\s.,]+)/is);
    if (vatSummaryM) {
        // m[3] az ÁFA (Ft) értéke
        const neg = vatSummaryM[3].trim().startsWith('-');
        const v = parseNum(vatSummaryM[3].trim().replace(/^-\s*/, ''));
        if (v > 0) vatAmount = (neg ? '-' : '') + Math.round(v).toLocaleString('hu-HU') + ' Ft';
    }
    // Fallback: keresünk "ÁFA érték (Ft)" utáni értéket
    if (!vatAmount) {
        const vatM = t.match(/[aá]fa\s+[eé]rt[eé]k\s*\(Ft\)[:\s]+([-\d][\d\s.,]+)/i)
            || t.match(/[aá]fa[^:\d]{0,20}[:\s]+([-\d][\d\s.,]+)\s*(?:Ft|$)/im);
        if (vatM) {
            const neg = vatM[1].trim().startsWith('-');
            const v = parseNum(vatM[1].trim().replace(/^-\s*/, ''));
            if (v > 0 && v < 100000000) vatAmount = (neg ? '-' : '') + Math.round(v).toLocaleString('hu-HU') + ' Ft';
        }
    }
    // Számított: ha nettó + bruttó ismert
    if (!vatAmount && netAmount && amount !== 0) {
        const netV = parseNum(netAmount.replace(/[^\d\-.,]/g, '').replace(/\./g, ''));
        const brutV = Math.abs(amount);
        if (netV > 0 && brutV > netV) {
            const calcVat = brutV - netV;
            if (calcVat < brutV * 0.4) vatAmount = Math.round(calcVat).toLocaleString('hu-HU') + ' Ft (számított)';
        }
    }

    // ---- JÖVEDÉKI ADÓ ----
    let exciseTax = '';
    // "Jövedéki adó összesen  2 229  kWh  677  27  860" – nettó érték (677) és bruttó (860)
    const jovedM = t.match(/j[oö]ved[eé]ki\s+ad[oó]\s+összesen\s+[\d\s.,]+\s*(?:kWh|MWh|MJ)?\s+([\d\s.,]+)\s+27\s+([\d\s.,]+)/i)
        || t.match(/j[oö]ved[eé]ki\s+ad[oó]\s+összesen\s+([\d\s.,]+)\s*(?:Ft)?/i);
    if (jovedM) {
        const v = parseNum(jovedM[jovedM[2] ? 2 : 1]);  // bruttó ha van, egyébként nettó
        if (v > 0) exciseTax = Math.round(v).toLocaleString('hu-HU') + ' Ft';
    }
    // ELMŰ: "Jövedéki adó összesen  NNN  16.765" 
    if (!exciseTax) {
        const elmuJovedM = t.match(/j[oö]ved[eé]ki\s+ad[oó]\s+összesen\s+([\d.,]+)\s+([\d.,]+)/i);
        if (elmuJovedM) {
            const v = parseNum(elmuJovedM[2]);
            if (v > 0) exciseTax = Math.round(v).toLocaleString('hu-HU') + ' Ft';
        }
    }

    // ---- EGYSÉGÁR ----
    let unitPrice = '';
    const upM = t.match(/([\d.,]+)\s*Ft\/MJ/i) || t.match(/([\d.,]+)\s*Ft\/m[³3]/i) || t.match(/([\d.,]+)\s*Ft\/kWh/i);
    if (upM) {
        const v = parseNum(upM[1]);
        if (v > 0 && v < 100000) {
            const unit = /MJ/i.test(upM[0]) ? 'Ft/MJ' : /m[³3]/i.test(upM[0]) ? 'Ft/m³' : 'Ft/kWh';
            unitPrice = v.toLocaleString('hu-HU', { maximumFractionDigits: 5 }) + ' ' + unit;
        }
    }

    // ---- SZERZŐDÉSSZÁM ----
    let contractNumber = '';
    const contractM = t.match(/szerz[oő]d[eé]s(?:es\s+foly[oó]sz[aá]mla|sz[aá]m)[:\s]+([A-Z0-9\-\/]{4,30})/i)
        || t.match(/szerz[oő]d[eé]s\s+sz[aá]m[:\s]+([A-Z0-9\-\/]{4,30})/i);
    if (contractM) contractNumber = contractM[1].trim();

    // ---- ÜGYFÉL AZONOSÍTÓ ----
    let customerId = '';
    const customerM = t.match(/ügyf[eé]l\s+azonosít[oó][:\s]+([A-Z0-9\-]{5,20})/i)
        || t.match(/ügyf[eé]l\s+sz[aá]m[:\s]+([A-Z0-9\-]{5,20})/i)
        || t.match(/vev[oő]\s+azonosít[oó][:\s]+([A-Z0-9\-]{5,20})/i);
    if (customerM) customerId = customerM[1].trim();

    // ---- SZÁMLÁZÁSI CÍM ----
    let billingAddress = '';
    const billingM = t.match(/sz[aá]ml[aá]z[aá]si\s+c[ií]m[:\s]+([^:]{5,80}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató))/i)
        || t.match(/sz[aá]ml[aá]z[aá]si\s+hely[:\s]+([^:]{5,80}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató))/i);
    if (billingM) billingAddress = billingM[1].replace(/\s+/g, ' ').trim().substring(0, 120);

    // ---- SZOLGÁLTATÁSI CÍM (ha különbözik) ----
    let serviceAddress = '';
    const serviceM = t.match(/szolg[aá]ltat[aá]si\s+c[ií]m[:\s]+([^:]{5,80}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató))/i);
    if (serviceM) serviceAddress = serviceM[1].replace(/\s+/g, ' ').trim().substring(0, 120);

    // ---- EGYEDI MEGJEGYZÉSEK VAGY TOVÁBBI ADATOK ----
    let notes = '';
    // Keresünk bármilyen további hasznos információt, pl. "Megjegyzés:" vagy "Egyéb:"
    const notesM = t.match(/(?:megjegyz[eé]s|egy[eé]b|inform[aá]ci[oó])[:\s]+([^:]{10,200}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató|$))/i);
    if (notesM) notes = notesM[1].replace(/\s+/g, ' ').trim().substring(0, 200);

    // ---- FIZETÉSI MÓD ----
    let paymentMethod = '';
    const paymentM = t.match(/fizet[eé]si\s+m[oó]d[:\s]+([^:]{3,50}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató|megjegyz|$))/i)
        || t.match(/fizetési[:\s]+([^:]{3,50}?)(?=\s+(?:adószám|felhasznál|elsz|szolgáltató|$))/i);
    if (paymentM) paymentMethod = paymentM[1].replace(/\s+/g, ' ').trim().substring(0, 100);

    // ---- KONFIDENCIA ----
    const hasMeter = !!(meterReadingCurrent || meterReadingPrev || lastSettledReading);
    const hasConsump = consumption !== '-';
    const hasAmount = amount !== 0;
    const hasSerial = serial.length >= 6;
    const hasProvider = provider !== 'Ismeretlen';
    const hasDue = dueDate.length > 0;
    const hasNet = netAmount.length > 0;
    const hasPod = podId.length > 0;
    const fields = [hasMeter, hasConsump, hasAmount, hasSerial, hasProvider, hasDue, hasNet, hasPod].filter(Boolean).length;
    const confidence = Math.min(98, Math.round(40 + fields * 8));

    const empty = (v) => (!v || String(v).trim() === '') ? '—' : String(v).trim();
    return {
        provider, type, serial: serial || '—', date, dueDate, amount, currency,
        isNegativeAmount,
        consumption,
        consumptionM3: empty(consumptionM3),
        consumptionKwh: empty(consumptionKwh),
        consumptionMJ: empty(consumptionMJ),
        meterReadingCurrent: empty(meterReadingCurrent),
        meterReadingPrev: empty(meterReadingPrev),
        meterReadingDelta: empty(meterReadingDelta),
        lastSettledReading: empty(lastSettledReading),
        unitPrice: unitPrice || '—',
        taxId: taxId || '—',
        confidence,
        buyerName: empty(buyerName),
        consumptionAddress: empty(consumptionAddress),
        podId: empty(podId),
        meterSerial: empty(meterSerial),
        netAmount: empty(netAmount),
        vatAmount: empty(vatAmount),
        exciseTax: empty(exciseTax),
        billingPeriod: empty(billingPeriod),
        contractNumber: empty(contractNumber),
        paymentMethod: empty(paymentMethod),
        customerId: empty(customerId),
        billingAddress: empty(billingAddress),
        serviceAddress: empty(serviceAddress),
        notes: empty(notes)
    };
}


if (ocrBtn) {
    ocrBtn.onclick = async () => {
        const files = ocrFileInput.files;
        if (!files || files.length === 0) {
            showToast('Kérem, válasszon egy fájlt!', 'error');
            return;
        }

        const originalText = ocrBtn.innerHTML;
        ocrBtn.disabled = true;
        ocrBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Beolvasás...';
        ocrResults.innerHTML = `<div style="padding:1rem; text-align:center;">Szövegkivonatolás folyamatban (${files.length} fájl)... <i class="fas fa-brain"></i></div>`;

        const allResults = [];

        for (const file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'bmp', 'webp', 'tiff', 'gif'].includes(ext);
            const isPdf = ext === 'pdf';

            // --- Frissítjük az állapotüzenetet ---
            ocrResults.innerHTML = `<div style="padding:1rem; text-align:center;">
                <i class="fas fa-spinner fa-spin"></i><br><br>
                <strong>${file.name}</strong><br>
                <small>${isPdf ? 'PDF szöveg kiolvasása...' : isImage ? 'Képfelismerés (OCR) folyamatban...' : 'Feldolgozás...'}</small>
            </div>`;

            try {
                let rawText = '';

                if (isPdf) {
                    rawText = await extractTextFromPdf(file);
                } else if (isImage) {
                    rawText = await extractTextFromImage(file);
                } else {
                    // Szöveges fájl esetén direkt olvasás
                    rawText = await file.text();
                }

                if (!rawText || rawText.trim().length < 10) {
                    allResults.push({ file: file.name, error: true, msg: 'Nem sikerült szöveget kinyerni a fájlból' });
                    continue;
                }

                const analyzed = analyzeText(rawText, file.name);
                const matchedNode = findMatchingNode(analyzed);
                allResults.push({
                    file: file.name,
                    fileObject: file,
                    rawText,
                    matchedNodeId: matchedNode ? matchedNode.id : null,
                    matchedNodeLabel: matchedNode ? matchedNode.label : null,
                    ...analyzed
                });

            } catch (err) {
                console.error('OCR hiba:', err);
                allResults.push({ file: file.name, error: true, msg: 'Hiba: ' + err.message });
            }
        }

        window.lastOcrResults = allResults;
        window.lastOcrResult = allResults.find(r => !r.error) || null;

        const confColor = (c) => c > 85 ? '#4caf50' : c > 65 ? '#ff9800' : '#ff5252';

        ocrResults.innerHTML = `
            <div class="ocr-results-grid" style="display:flex; flex-direction:column; gap:1rem; animation: slideIn 0.5s;">
                ${allResults.map((r) => r.error ? `
                    <div class="ocr-error-card glass-card">
                        <span><i class="fas fa-exclamation-triangle" style="color:#ff5252;"></i> ${r.file}</span>
                        <span style="color:#ff5252;">${r.msg}</span>
                    </div>
                ` : `
                    <div class="ocr-result-card glass-card">
                        <div class="ocr-result-header">
                            <span><i class="fas fa-file-invoice"></i> ${r.file}</span>
                            <span class="ocr-confidence" style="color:${confColor(r.confidence)};">${r.confidence}% biztonság</span>
                        </div>
                        <div class="ocr-params-grid">
                              <div class="ocr-param" style="grid-column:1/-1; background:rgba(212,168,83,0.05); border:1px solid rgba(212,168,83,0.2); border-radius:6px; margin-bottom:0.8rem; padding: 0.8rem; display:flex; flex-direction:column; gap:0.5rem;">
                                <span class="ocr-label" style="color:var(--amber); font-weight:700; font-size:0.65rem; letter-spacing:1px;">FELISMERT CÉLMAPPA (Módosítható)</span>
                                
                                <input type="text" placeholder="Gyorskeresés (Cím vagy POD)..." 
                                       style="width:100%; font-size:0.75rem; padding:0.4rem 0.6rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:4px; color:var(--text-muted);"
                                       oninput="window.filterOcrSelect(this, 'ocr-node-select-${r.file.replace(/[^a-z0-9]/gi, '_')}')">

                                <select class="ocr-node-select premium-input" id="ocr-node-select-${r.file.replace(/[^a-z0-9]/gi, '_')}" style="width: 100%; background:var(--glass-bg); border-radius:4px; padding:0.4rem;">
                                    <option value="">-- Válasszon célhelyet --</option>
                                    ${(flatNeoNodes || []).filter(n => n.node_type === 'pod').map(n =>
            `<option value="${n.id}" ${n.id === r.matchedNodeId ? 'selected' : ''}>${n.pathLabel || n.label}</option>`
        ).join('')}
                                </select>
                              </div>
                            <div class="ocr-param"><span class="ocr-label">JELLEG</span><strong>${r.type}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">SZOLGÁLTATÓ</span><strong>${r.provider}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">SORSZÁM</span><strong>${r.serial}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">KELT</span><strong>${r.date}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">HATÁRIDŐ</span><strong>${r.dueDate || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">ELSZÁM. IDŐSZAK</span><strong>${r.billingPeriod || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">FIZETÉSI MÓD</span><strong>${r.paymentMethod || '—'}</strong></div>

                            <div class="ocr-param ocr-section-title" style="grid-column:1/-1; margin-top:0.5rem; border-top:1px solid var(--glass-border); padding-top:0.5rem; font-size:0.6rem; letter-spacing:2px; color:var(--amber); opacity:0.7;">ÖSSZEGEK</div>
                            <div class="ocr-param"><span class="ocr-label">FIZETENDŐ (BRUTTÓ)</span><strong class="ocr-highlight" style="color:${r.isNegativeAmount ? '#4caf50' : 'var(--amber)'};">${r.amount !== 0 ? (r.isNegativeAmount ? 'Visszatérítés: ' : '') + Math.abs(r.amount).toLocaleString('hu-HU') + ' ' + r.currency : 'N/A'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">NETTÓ</span><strong>${r.netAmount || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">ÁFA (27%)</span><strong>${r.vatAmount || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">JÖVEDÉKI ADÓ</span><strong>${r.exciseTax || '—'}</strong></div>

                            <div class="ocr-param ocr-section-title" style="grid-column:1/-1; margin-top:0.5rem; border-top:1px solid var(--glass-border); padding-top:0.5rem; font-size:0.6rem; letter-spacing:2px; color:var(--amber); opacity:0.7;">MÉRŐSZÁMOK & FOGYASZTÁS</div>
                            <div class="ocr-param"><span class="ocr-label">ZÁRÓ MÉRŐÁLLÁS</span><strong class="ocr-highlight">${r.meterReadingCurrent !== '—' ? r.meterReadingCurrent + ' m³' : '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">INDULÓ MÉRŐÁLLÁS</span><strong>${r.meterReadingPrev !== '—' ? r.meterReadingPrev + ' m³' : '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">KÜLÖNBSÉG (Δ)</span><strong class="ocr-highlight">${r.meterReadingDelta !== '—' ? r.meterReadingDelta : '—'}</strong></div>
                            ${r.lastSettledReading !== '—' ? `<div class="ocr-param"><span class="ocr-label">UTOLSÓ ELSZÁMOLT ÁLLÁS</span><strong>${r.lastSettledReading}</strong></div>` : ''}
                            <div class="ocr-param"><span class="ocr-label">FOGYASZTÁS (m³)</span><strong>${r.consumptionM3 !== '—' ? r.consumptionM3 : '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">FOGYASZTÁS (MJ)</span><strong>${r.consumptionMJ !== '—' ? r.consumptionMJ : '—'}</strong></div>
                            ${r.consumptionKwh !== '—' ? `<div class="ocr-param"><span class="ocr-label">FOGYASZTÁS (kWh)</span><strong>${r.consumptionKwh}</strong></div>` : ''}
                            <div class="ocr-param"><span class="ocr-label">EGYSÉGÁR</span><strong>${r.unitPrice || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">MÉRŐÓRA GYÁRI SZ.</span><strong>${r.meterSerial || '—'}</strong></div>

                            <div class="ocr-param ocr-section-title" style="grid-column:1/-1; margin-top:0.5rem; border-top:1px solid var(--glass-border); padding-top:0.5rem; font-size:0.6rem; letter-spacing:2px; color:var(--amber); opacity:0.7;">AZONOSÍTÓK</div>
                            <div class="ocr-param"><span class="ocr-label">VEVŐ NEVE</span><strong>${r.buyerName || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">FELH. HELY CÍM</span><strong>${r.consumptionAddress || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">POD / MÉRÉSI PONT</span><strong>${r.podId || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">SZERZ. SZÁM</span><strong>${r.contractNumber || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">ADÓSZÁM (VEVŐ)</span><strong>${r.taxId || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">ÜGYFÉL AZONOSÍTÓ</span><strong>${r.customerId || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">SZÁMLÁZÁSI CÍM</span><strong>${r.billingAddress || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">SZOLGÁLTATÁSI CÍM</span><strong>${r.serviceAddress || '—'}</strong></div>
                            <div class="ocr-param"><span class="ocr-label">MEGJEGYZÉSEK</span><strong>${r.notes || '—'}</strong></div>
                        </div>
                        ${r.rawText ? `<details class="ocr-raw"><summary>Nyers kinyert szöveg (teljes, görgethető)</summary><pre class="ocr-raw-full">${escapeHtml(r.rawText)}</pre></details>` : ''}
                    </div>
                `).join('')}
                <button class="btn-premium wide" style="margin-top:0.5rem;" onclick="saveAllOcrResults()">
                    <i class="fas fa-file-import"></i> Mind Mentése az Archívumba (${allResults.filter(r => !r.error).length} irat)
                </button>
                <p class="ocr-hint">Ellenőrizze az adatok pontosságát mentés előtt.</p>
            </div>`;

        ocrBtn.disabled = false;
        ocrBtn.innerHTML = originalText;
    };
}

// --- OCR Auto-Mapping Helper ---
function findMatchingNode(res) {
    if (!window.neoNodes) return null;

    const pod = String(res.podId || '').trim().toLowerCase();
    const addr = String(res.consumptionAddress || '').trim().toLowerCase();

    if (!pod && !addr) return null;

    // 1. Try POD match (high confidence)
    if (pod && pod.length > 5) {
        const match = neoNodes.find(n =>
            n.node_type === 'pod' &&
            (String(n.label).toLowerCase().includes(pod) || pod.includes(String(n.label).toLowerCase()))
        );
        if (match) return match;
    }

    // 2. Try Address match (medium confidence)
    if (addr && addr.length > 8) {
        const match = neoNodes.find(n =>
            (n.node_type === 'pod' || n.node_type === 'folder') &&
            (String(n.label).toLowerCase().includes(addr) || addr.includes(String(n.label).toLowerCase()))
        );
        if (match) return match;
    }

    return null;
}

async function saveOcrResults() {
    if (!window.lastOcrResult) return;
    const res = window.lastOcrResult;

    let selectedNodeId = null;
    const card = document.querySelector('.ocr-result-card');
    if (card) selectedNodeId = card.querySelector('.ocr-node-select').value;

    let nodeId = selectedNodeId || res.matchedNodeId || activeNeoNodeId;

    if (!nodeId) {
        showToast('Kérem, válasszon célállomást az irathoz!', 'error');
        return;
    }

    let pdfUrl = null;
    if (res.fileObject) {
        const fileName = `${Date.now()}_${sanitizeFileName(res.file)}`;
        const { data, error: uploadError } = await supabaseClient.storage.from('neo-documents').upload(fileName, res.fileObject);
        if (uploadError) {
            showToast('Hiba a fájl feltöltése során: ' + uploadError.message, 'error');
            return; // STOP IF UPLOAD FAILS
        }
        const { data: { publicUrl } } = supabaseClient.storage.from('neo-documents').getPublicUrl(fileName);
        pdfUrl = publicUrl;
    }

    const payload = buildOcrPayload(nodeId, res, pdfUrl);

    const { error } = await supabaseClient.from('neo_invoices').insert([payload]);
    if (!error) {
        showToast('OCR adatok sikeresen archiválva!');
        ocrResults.innerHTML = '<div class="empty-state">Sikeresen mentve az Iratok közé.</div>';
        fetchInvoices(nodeId);
    } else {
        showToast('Hiba a mentés során: ' + error.message, 'error');
    }
}

async function saveAllOcrResults() {
    const results = (window.lastOcrResults || []).filter(r => !r.error);
    if (results.length === 0) return;

    const payloads = [];
    const cardElements = document.querySelectorAll('.ocr-result-card');
    let lastSavedNodeId = activeNeoNodeId;

    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const card = cardElements[i];
        const selectedNodeId = card ? card.querySelector('.ocr-node-select').value : null;

        let nodeId = selectedNodeId || r.matchedNodeId || activeNeoNodeId;

        // Final fallback if still no target
        if (!nodeId) {
            showToast(`A(z) ${r.file} fájlhoz nincs célállomás kiválasztva!`, 'error');
            continue;
        }

        lastSavedNodeId = nodeId;

        let pdfUrl = null;
        if (r.fileObject) {
            const fileName = `${Date.now()}_${sanitizeFileName(r.file)}`;
            const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('neo-documents').upload(fileName, r.fileObject);
            if (uploadError) {
                showToast(`Hiba a(z) ${r.file} feltöltésekor: ${uploadError.message}`, 'error');
                continue;
            }
            const { data: { publicUrl } } = supabaseClient.storage.from('neo-documents').getPublicUrl(fileName);
            pdfUrl = publicUrl;
        }
        payloads.push(buildOcrPayload(nodeId, r, pdfUrl));
    }

    if (payloads.length === 0) {
        showToast('Kérem, válasszon célállomást legalább egy irathoz!', 'error');
        return;
    }

    const { error } = await supabaseClient.from('neo_invoices').insert(payloads);
    if (!error) {
        showToast(`${payloads.length} irat sikeresen archiválva!`);
        ocrResults.innerHTML = '<div class="empty-state">Az összes irat elmentve a Számlanyilvántartásba.</div>';
        if (lastSavedNodeId) fetchInvoices(lastSavedNodeId);
        refreshDashboard();
    } else {
        showToast('Hiba a tömeges mentés során: ' + error.message, 'error');
    }
}

async function fetchNeoNodes() {
    try {
        const { data, error } = await supabaseClient
            .from('neo_nodes')
            .select('*')
            .order('label');

        if (error) throw error;

        if (data && data.length > 0) {
            // Reconstruct hierarchy
            const map = {};
            data.forEach(n => map[n.id] = { ...n, children: [] });
            const tree = [];
            data.forEach(n => {
                if (n.parent_id && map[n.parent_id]) {
                    map[n.parent_id].children.push(map[n.id]);
                } else {
                    tree.push(map[n.id]);
                }
            });
            neoNodes = tree;
            flatNeoNodes = flattenNeoData(tree);
        } else if (typeof NEO_DATA !== 'undefined') {
            neoNodes = NEO_DATA;
            flatNeoNodes = flattenNeoData(NEO_DATA);
        }

        renderNeoTree();
        syncUtilityLocations();
    } catch (err) {
        console.error('Error fetching nodes:', err);
        if (typeof NEO_DATA !== 'undefined') {
            neoNodes = NEO_DATA;
            flatNeoNodes = flattenNeoData(NEO_DATA);
            renderNeoTree();
        }
    }
}

function flattenNeoData(nodes, parentLabel = '') {
    let flat = [];
    const recurse = (list, pLabel = '') => {
        list.forEach(n => {
            const normalized = {
                id: n.id || n.label,
                label: n.label,
                pathLabel: pLabel ? `${pLabel} - ${n.label}` : n.label,
                node_type: (n.type || !n.children || n.children.length === 0) ? 'pod' : 'folder'
            };
            flat.push(normalized);
            if (n.children) recurse(n.children, n.label);
        });
    };
    recurse(nodes, parentLabel);
    return flat;
}

// Global filter helper for OCR dropdowns
function filterOcrSelect(input, selectId) {
    const filter = input.value.toLowerCase();
    const select = document.getElementById(selectId);
    const options = select.options;
    for (let i = 1; i < options.length; i++) {
        const txt = options[i].text.toLowerCase();
        options[i].style.display = txt.includes(filter) ? '' : 'none';
    }
}
window.filterOcrSelect = filterOcrSelect;

async function deleteInvoice(id) {
    const modal = document.getElementById('confirm-modal');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const deleteBtn = document.getElementById('confirm-delete-btn');

    if (!modal || !cancelBtn || !deleteBtn) {
        if (!confirm('Biztosan törölni szeretné ezt az iratot? A folyamat nem visszavonható.')) return;
    } else {
        modal.style.display = 'flex';
        const confirmDelete = await new Promise((resolve) => {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(false);
            };
            deleteBtn.onclick = () => {
                modal.style.display = 'none';
                resolve(true);
            };
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    resolve(false);
                }
            };
        });
        if (!confirmDelete) return;
    }

    try {
        const { error } = await supabaseClient
            .from('neo_invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('Irat sikeresen törölve.');
        if (activeNeoNodeId) fetchInvoices(activeNeoNodeId);
        refreshDashboard();
    } catch (err) {
        showToast('Hiba a törlés során: ' + err.message, 'error');
    }
}
window.deleteInvoice = deleteInvoice;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateClock();
    setInterval(updateClock, 1000);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    refreshDashboard();
    fetchNeoNodes(); // Load from DB
});

const App = {
    async exportCategorized() {
        if (!activeNeoNodeId) {
            showToast('Kérem, válasszon intézményt a Számlanyilvántartásban!', 'error');
            return;
        }
        const node = neoNodes.find(n => n.id === activeNeoNodeId);
        const { data, error } = await supabaseClient.from('neo_invoices').select('*').eq('node_id', activeNeoNodeId).order('invoice_type').order('invoice_date', { ascending: false });
        if (error || !data || data.length === 0) {
            showToast('Nincs exportálható adat!', 'error');
            return;
        }

        // Group by invoice_type
        const groups = {};
        data.forEach(inv => {
            if (!groups[inv.invoice_type]) groups[inv.invoice_type] = [];
            groups[inv.invoice_type].push(inv);
        });

        let text = `SZÁMLANYILVÁNTARTÁS EXPORT\n`;
        text += `Intézmény: ${node?.label || 'Ismeretlen'}\n`;
        text += `Export dátum: ${new Date().toLocaleDateString('hu-HU')}\n`;
        text += `${'='.repeat(55)}\n\n`;

        let grandTotal = 0;
        for (const [type, invoices] of Object.entries(groups)) {
            text += `>>> ${type.toUpperCase()} <<<\n`;
            text += `${'-'.repeat(55)}\n`;
            let typeTotal = 0;
            invoices.forEach(inv => {
                text += `  ${inv.invoice_date}  |  ${(inv.provider || '').padEnd(30)}  |  ${inv.amount} ${inv.currency}\n`;
                text += `    Sorszám: ${inv.invoice_serial || '-'}\n`;
                typeTotal += Number(inv.amount) || 0;
            });
            text += `  Részosszeg (${type}): ${typeTotal.toLocaleString('hu-HU')} Ft\n\n`;
            grandTotal += typeTotal;
        }

        text += `${'='.repeat(55)}\n`;
        text += `Végrosszeg: ${grandTotal.toLocaleString('hu-HU')} Ft\n`;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `szamlanyilvantartas_${node?.label?.replace(/\s/g, '_') || 'export'}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Export letöltés elkezdődött!');
    }
};

/**
 * POLC Module Data and Logic
 */

const POLC_DATA = [
    {
        id: "root",
        label: "Nagyatád Város Ügyfél",
        icon: "fas fa-user",
        color: "#0057A0",
        children: [
            {
                label: "Nagyatád Város Önkormányzat Városgondnoksága",
                icon: "fas fa-th-large",
                color: "#009EDE",
                children: [
                    {
                        label: "7500 Nagyatád, Kiszely L. u. 15.",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "39N040058152000V", type: "GAS", icon: "fas fa-fire", color: "#eb8c60" }
                        ]
                    },
                    {
                        label: "7500 Nagyatád, Piac tér 3. A ép.",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "39N040006274000Q", type: "GAS", icon: "fas fa-fire", color: "#eb8c60" }
                        ]
                    },
                    {
                        label: "7500 Nagyatád, Szabadság u. 17.",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "HU000120-11-S00000000000000025167", type: "ELECTRIC", icon: "fas fa-bolt", color: "#f5db49" },
                            { label: "39N0401059250000", type: "GAS", icon: "fas fa-fire", color: "#eb8c60" }
                        ]
                    },
                    {
                        label: "7500 Nagyatád, Vásárcsarnok 0/B",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "HU000120-11-S00000000000000025166", type: "ELECTRIC", icon: "fas fa-bolt", color: "#f5db49" }
                        ]
                    }
                ]
            },
            {
                label: "Nagyatád Város Önkormányzata",
                icon: "fas fa-th-large",
                color: "#009EDE",
                children: [
                    {
                        label: "7500 Nagyatád, Ady E. u. 1/a ép.",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "HU000120F11-S00000000000000004331", type: "ELECTRIC", icon: "fas fa-bolt", color: "#f5db49" },
                            { label: "20234065", type: "WATER", icon: "fas fa-tint", color: "#3366e6" }
                        ]
                    },
                    {
                        label: "7500 Nagyatád, Baross Gábor u. 1.",
                        icon: "fas fa-home",
                        color: "#009EDE",
                        children: [
                            { label: "HU000120-11-S00000000000000029807", type: "ELECTRIC", icon: "fas fa-bolt", color: "#f5db49" },
                            { label: "39N0400248260002", type: "GAS", icon: "fas fa-fire", color: "#eb8c60" },
                            { label: "20540751", type: "WATER", icon: "fas fa-tint", color: "#3366e6" }
                        ]
                    }
                ]
            }
        ]
    }
];

// Mock Invoices
const generateInvoices = (pod, count = 20) => {
    const invoices = [];
    const types = ["RHD", "ENERGIA", "VÍZ", "CSATORNA"];
    const providers = ["E.ON Dél-Dunántúli Áramhálózati Zrt.", "MVM Next Energiakereskedelmi Zrt.", "DRV Zrt."];

    for (let i = 0; i < count; i++) {
        const date = new Date(2023, 11 - Math.floor(i / 2), 15 - (i % 15));
        const dueDate = new Date(date);
        dueDate.setDate(date.getDate() + 20);

        const periodStart = new Date(date);
        periodStart.setDate(1);
        const periodEnd = new Date(date);
        periodEnd.setMonth(date.getMonth() + 1);
        periodEnd.setDate(0);

        invoices.push({
            pod: pod,
            provider: providers[Math.floor(Math.random() * providers.length)],
            type: types[Math.floor(Math.random() * types.length)],
            serial: "130" + Math.floor(100000000 + Math.random() * 900000000),
            date: date.toISOString().split('T')[0],
            period: `${periodStart.toISOString().split('T')[0]} - ${periodEnd.toISOString().split('T')[0]}`,
            amount: Math.floor(5000 + Math.random() * 500000).toLocaleString() + " Ft",
            consumption: Math.floor(Math.random() * 1500) + " unit",
            dueDate: dueDate.toISOString().split('T')[0],
            start: periodStart.toISOString().split('T')[0],
            end: periodEnd.toISOString().split('T')[0]
        });
    }
    return invoices;
};

const PolcApp = {
    init() {
        this.renderTree();
        this.setupEventListeners();
    },

    renderTree(filter = "") {
        const container = document.getElementById('tree-view');
        container.innerHTML = '';

        const renderNode = (node, parentElement) => {
            if (filter && !this.nodeMatches(node, filter) && !this.hasMatchingChild(node, filter)) {
                return;
            }

            const nodeEl = document.createElement('div');
            nodeEl.className = 'tree-node';
            if (node.children) nodeEl.classList.add('has-children');

            const contentEl = document.createElement('div');
            contentEl.className = 'node-content';

            if (node.children) {
                const toggler = document.createElement('i');
                toggler.className = 'fas fa-caret-down toggler';
                toggler.onclick = (e) => {
                    e.stopPropagation();
                    nodeEl.classList.toggle('collapsed');
                    toggler.classList.toggle('fa-caret-right');
                    toggler.classList.toggle('fa-caret-down');
                };
                contentEl.appendChild(toggler);
            } else {
                const spacer = document.createElement('span');
                spacer.style.width = '1.25rem';
                spacer.style.display = 'inline-block';
                contentEl.appendChild(spacer);
            }

            const icon = document.createElement('i');
            icon.className = node.icon + ' node-icon';
            icon.style.color = node.color;
            contentEl.appendChild(icon);

            const label = document.createElement('span');
            label.className = 'node-label';
            label.textContent = node.label;
            contentEl.appendChild(label);

            contentEl.onclick = () => {
                document.querySelectorAll('.node-content').forEach(el => el.classList.remove('selected'));
                contentEl.classList.add('selected');
                if (!node.children) {
                    this.showInvoices(node.label);
                }
            };

            nodeEl.appendChild(contentEl);

            if (node.children) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'node-children';
                node.children.forEach(child => renderNode(child, childrenContainer));
                nodeEl.appendChild(childrenContainer);
            }

            parentElement.appendChild(nodeEl);
        };

        POLC_DATA.forEach(node => renderNode(node, container));
    },

    nodeMatches(node, filter) {
        return node.label.toLowerCase().includes(filter.toLowerCase());
    },

    hasMatchingChild(node, filter) {
        if (!node.children) return false;
        return node.children.some(child => this.nodeMatches(child, filter) || this.hasMatchingChild(child, filter));
    },

    setupEventListeners() {
        document.getElementById('tree-search').oninput = (e) => {
            this.renderTree(e.target.value);
        };
    },

    showInvoices(pod) {
        const container = document.getElementById('invoice-list');
        const count = 20 + Math.floor(Math.random() * 30);
        const data = generateInvoices(pod, count);

        document.getElementById('selected-pod-title').textContent = pod;

        let html = `
            <table class="premium-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Szolgáltató</th>
                        <th>Típus</th>
                        <th>Sorszám</th>
                        <th>Kelt</th>
                        <th>Fizetendő</th>
                        <th>Határidő</th>
                        <th>Műveletek</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((inv, index) => {
            html += `
                <tr>
                    <td>${index + 1}.</td>
                    <td>${inv.provider}</td>
                    <td><span class="badge badge-${inv.type.toLowerCase()}">${inv.type}</span></td>
                    <td>${inv.serial}</td>
                    <td>${inv.date}</td>
                    <td class="amount">${inv.amount}</td>
                    <td>${inv.dueDate}</td>
                    <td>
                        <button class="btn-icon" title="Megtekintés"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon" title="Letöltés"><i class="fas fa-download"></i></button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
        container.classList.add('fade-in');
        setTimeout(() => container.classList.remove('fade-in'), 500);
    },

    exportPDF() {
        const pod = document.getElementById('selected-pod-title').textContent;
        if (pod === 'Válasszon egy fogyasztási helyet') {
            alert('Kérjük válasszon egy fogyasztási helyet az exportáláshoz!');
            return;
        }

        const element = document.getElementById('invoice-list');
        const opt = {
            margin: 10,
            filename: `POLC_Export_${pod}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Add a temporary title to the element for the PDF
        const title = document.createElement('h3');
        title.textContent = `Számlalista: ${pod}`;
        title.style.marginBottom = '20px';
        title.style.textAlign = 'center';
        title.style.color = '#000';
        element.prepend(title);

        html2pdf().from(element).set(opt).save().then(() => {
            element.removeChild(title);
        });
    }
};

window.onload = () => PolcApp.init();

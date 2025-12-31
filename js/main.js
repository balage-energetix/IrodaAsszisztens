/**
 * Irodai Asszisztens - Global Core Logic (Phase 3)
 */

const App = {
    state: {
        user: JSON.parse(localStorage.getItem('auth_user')),
        theme: localStorage.getItem('theme') || 'light',
        bgColor: localStorage.getItem('bg-color') || '#fdfcf0',
        location: { lat: 46.229, lon: 17.365, name: 'Nagyatád' }
    },

    init() {
        this.applyTheme();
        this.applyBgColor();
        this.initClock();
        this.fetchWeather();
        this.injectGlobalNav();
        this.setupAuth();
        this.initSearch();
        console.log("Irodai Asszisztens Phase 3 initialized");
    },

    // --- Layout & Nav Injection ---
    injectGlobalNav() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        // Ensure we don't inject twice
        if (header.querySelector('.nav-dropdown')) return;

        const navHtml = `
            <div class="nav-dropdown">
                <button style="background:none; border:none; font-size:1.5rem; color:var(--text-main); cursor:pointer;">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="nav-dropdown-content">
                    <a href="${this.getPath()}index.html" class="nav-dropdown-item"><i class="fas fa-home"></i> Műszerfal</a>
                    <hr style="border:0; border-top:1px solid var(--border-color); margin:5px 0;">
                    <a href="${this.getPath()}modules/map/index.html" class="nav-dropdown-item"><i class="fas fa-map"></i> Hiba Jelölő Térkép</a>
                    <a href="${this.getPath()}modules/calc/index.html" class="nav-dropdown-item"><i class="fas fa-calculator"></i> Számlázási Segéd</a>
                    <a href="${this.getPath()}modules/stocks/index.html" class="nav-dropdown-item"><i class="fas fa-chart-line"></i> Tőzsdei Árak</a>
                    <a href="${this.getPath()}modules/gallery/index.html" class="nav-dropdown-item"><i class="fas fa-camera"></i> Képtár</a>
                    <a href="${this.getPath()}modules/tools/ai_vision.html" class="nav-dropdown-item"><i class="fas fa-brain"></i> Képfelismerő AI</a>
                    <a href="${this.getPath()}modules/tools/pdfreader.html" class="nav-dropdown-item"><i class="fas fa-file-pdf"></i> PDF Kiolvasó</a>
                    <a href="${this.getPath()}modules/tools/pdfeditor.html" class="nav-dropdown-item"><i class="fas fa-file-signature"></i> PDF Szerkesztő</a>
                    <a href="${this.getPath()}modules/lean/index.html" class="nav-dropdown-item"><i class="fas fa-keyboard"></i> Billentyűkombinációk</a>
                    <a href="${this.getPath()}modules/tools/lean_office.html" class="nav-dropdown-item"><i class="fas fa-graduation-cap"></i> Irodai Lean</a>
                </div>
            </div>
        `;
        header.insertAdjacentHTML('beforeend', navHtml);

        // Inject standardized back button in modules
        if (window.location.pathname.includes('/modules/')) {
            const btn = document.createElement('a');
            btn.href = this.getPath() + 'index.html';
            btn.className = 'back-dash-btn';
            btn.innerHTML = '<i class="fas fa-home"></i>';
            document.body.prepend(btn);
        }
    },

    getPath() {
        // Simple relative path resolver
        const depth = (window.location.pathname.split('/').length - (window.location.pathname.endsWith('/') ? 1 : 2));
        let p = "";
        if (depth > 2) p = "../../";
        else if (depth > 1) p = "../";
        return p;
    },

    // --- Theme & Colors ---
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        const icon = document.getElementById('theme-toggle-icon');
        if (icon) icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    },

    applyBgColor() {
        if (this.state.theme === 'light') {
            document.body.style.backgroundColor = this.state.bgColor;
        } else {
            document.body.style.backgroundColor = '';
        }
    },

    setBgColor(color) {
        this.state.bgColor = color;
        localStorage.setItem('bg-color', color);
        this.applyBgColor();
    },

    // --- Core Features ---
    initClock() {
        const days = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
        const update = () => {
            const now = new Date();
            const clockEl = document.getElementById('global-clock');
            if (clockEl) {
                clockEl.innerHTML = `
                    <div class="clock-time" style="color:var(--primary); font-family:monospace; font-weight:800; font-size:1.1rem;">${now.toLocaleTimeString('hu-HU')}</div>
                    <div class="clock-date" style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${now.toLocaleDateString('hu-HU')}, ${days[now.getDay()]}</div>
                `;
            }
        };
        setInterval(update, 1000); update();
    },

    async fetchWeather() {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.state.location.lat}&longitude=${this.state.location.lon}&current=temperature_2m&daily=sunrise,sunset&timezone=auto`);
            const data = await res.json();
            const weatherEl = document.getElementById('header-weather');
            if (weatherEl && data.current) {
                const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                weatherEl.innerHTML = `
                    <div style="font-weight:800; font-size:0.9rem;"><i class="fas fa-temperature-high"></i> ${Math.round(data.current.temperature_2m)}°C</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);"><i class="fas fa-sun"></i> ${sunrise} | <i class="fas fa-moon"></i> ${sunset}</div>
                `;
            }
        } catch (e) { console.error(e); }
    },

    initSearch() {
        const searchInput = document.getElementById('dashboard-search');
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.feature-card').forEach(card => {
                const title = card.querySelector('h5').innerText.toLowerCase();
                card.style.display = title.includes(q) ? 'flex' : 'none';
            });
            // Hide empty categories
            document.querySelectorAll('.category-group').forEach(group => {
                const visible = Array.from(group.querySelectorAll('.feature-card')).some(c => c.style.display !== 'none');
                group.style.display = visible ? 'block' : 'none';
            });
        });
    },

    getExportFileName(type, ext) {
        const now = new Date();
        const d = now.toISOString().split('T')[0].split('-').join('');
        const t = now.toTimeString().split(' ')[0].split(':').join('').substring(0, 4);
        return `Irodai_${type}_${d}_${t}.${ext}`;
    },

    setupAuth() {
        window.onload = () => {
            const overlay = document.getElementById('auth-overlay');
            if (!overlay) return;
            if (this.state.user) {
                overlay.style.display = 'none';
                document.getElementById('app-main').style.display = 'block';
            }
        };
    },

    login() {
        localStorage.setItem('auth_user', JSON.stringify({ name: 'Admin' }));
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

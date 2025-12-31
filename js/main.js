/**
 * Irodai Asszisztens - Global Core Logic (Phase 3)
 */

const App = {
    state: {
        user: JSON.parse(localStorage.getItem('auth_user')),
        theme: localStorage.getItem('theme') || 'light',
        bgColor: localStorage.getItem('bg-color') || '#fdfcf0',
        location: { lat: 46.229, lon: 17.365, name: 'Nagyatád' },
        droneIndex: 1
    },

    init() {
        this.checkLogin();
        this.applyTheme();
        this.applyBgColor();
        this.initClock();
        this.fetchWeather();
        this.injectGlobalNav();
        this.initSearch();
        this.initHeaderDrone();
        this.initInteractivity();
        console.log("Irodai Asszisztens V3.3 initialized");
    },

    // --- Layout & Nav Injection ---
    injectGlobalNav() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const p = this.getPath();
        const logo = header.querySelector('.logo');
        if (logo) {
            logo.innerHTML = `<i class="fab fa-android"></i><span>IRODAI<br>ASSZISZTENS</span>`;
        }

        const existingNav = header.querySelector('.header-nav');
        if (existingNav) existingNav.remove();

        const navHtml = `
            <div class="header-nav" id="global-header-nav">
                <div class="nav-cat" data-cat="műszaki">MŰSZAKI <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/map/index.html" class="nav-item">Hiba Jelölő Térkép</a>
                        <a href="${p}modules/publiclight/index.html" class="nav-item">Közvilágítás</a>
                        <a href="${p}modules/gallery/index.html" class="nav-item">Éjszakai Drónfelvételek</a>
                        <a href="${p}modules/tools/videolibrary.html" class="nav-item">Videótár</a>
                        <a href="${p}modules/viz/index.html" class="nav-item">Vizualizáció</a>
                        <a href="${p}modules/tools/weather_log.html" class="nav-item">Időjárás Napló</a>
                    </div>
                </div>
                <div class="nav-cat" data-cat="elszámolási">ELSZÁMOLÁSI <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/calc/index.html" class="nav-item">Számlázási Segéd</a>
                        <a href="${p}modules/consumption/index.html" class="nav-item">Fogyasztási Helyek</a>
                        <a href="${p}modules/tools/pdfeditor.html" class="nav-item">PDF Szerkesztő</a>
                        <a href="${p}modules/tools/pdfreader.html" class="nav-item">PDF Kiolvasó</a>
                        <a href="${p}modules/utils/index.html" class="nav-item">Gyorsító Eszközök</a>
                        <a href="${p}modules/tools/checklist.html" class="nav-item">Check-lista</a>
                        <a href="${p}modules/stocks/index.html" class="nav-item">Tőzsdei Árak</a>
                    </div>
                </div>
                <div class="nav-cat" data-cat="információ">INFORMÁCIÓ <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/lean/index.html" class="nav-item">Billentyűkombinációk</a>
                        <a href="${p}modules/tools/lean_office.html" class="nav-item">Irodai Lean</a>
                        <a href="${p}modules/phonebook/index.html" class="nav-item">Telefonkönyv</a>
                        <a href="${p}modules/links/index.html" class="nav-item">Linkgyűjtemény</a>
                        <a href="${p}modules/tools/notes.html" class="nav-item">Feljegyzés</a>
                    </div>
                </div>
            </div>
        `;

        const infoArea = header.querySelector('.header-info');
        header.insertBefore(document.createRange().createContextualFragment(navHtml), infoArea);

        // Reposition Theme Toggle to the right of info
        infoArea.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <div id="header-weather" style="text-align: right; line-height: 1.2;"></div>
                    <div id="global-clock" style="text-align: right; line-height: 1.2;"></div>
                </div>
                <button onclick="App.toggleTheme()" style="background:none; border:none; font-size:1.4rem; color:var(--text-main); cursor:pointer;"><i id="theme-toggle-icon" class="fas fa-moon"></i></button>
            </div>
        `;

        // Click-to-open logic for Dropdowns
        document.querySelectorAll('.nav-cat').forEach(cat => {
            cat.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = cat.classList.contains('active');
                document.querySelectorAll('.nav-cat').forEach(c => c.classList.remove('active'));
                if (!isActive) cat.classList.add('active');
            });
        });
        document.addEventListener('click', () => {
            document.querySelectorAll('.nav-cat').forEach(c => c.classList.remove('active'));
        });

        // Inject standardized back button in modules sub-header
        if (window.location.pathname.includes('/modules/')) {
            const container = document.querySelector('main.container') || document.querySelector('main.container-fluid');
            if (container) {
                const subBar = document.createElement('div');
                subBar.className = 'sub-nav-bar';
                subBar.innerHTML = `<a href="${p}index.html" class="back-btn"><i class="fas fa-arrow-left"></i> VISSZA A MŰSZERFALRA</a>`;
                container.parentNode.insertBefore(subBar, container);
            }
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
        const picker = document.getElementById('spectrum-picker');
        if (picker) picker.value = color;
    },

    toggleSettings() {
        // Obsolete in 3.3
    },

    initHeaderDrone() {
        const p = this.getPath();
        const update = () => {
            const rand = Math.floor(Math.random() * 86) + 1;
            const imgUrl = `url('${p}pictures/(${rand}).jpg')`;
            document.documentElement.style.setProperty('--bg-drone', imgUrl);
        };
        update();
        setInterval(update, 60000); // 1 minute rotation
    },

    initInteractivity() {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mouse-x', `${x}%`);
            document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        });
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

    checkLogin() {
        const auth = localStorage.getItem('auth_id');
        if (auth === btoa('7575')) {
            this.state.user = { name: 'Admin' };
        } else {
            this.state.user = null;
        }

        window.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('auth-overlay');
            const main = document.getElementById('app-main');
            if (!overlay || !main) return;

            if (this.state.user) {
                overlay.style.display = 'none';
                main.style.display = 'block';
            } else {
                overlay.style.display = 'flex';
                main.style.display = 'none';
            }
        });
    },

    login() {
        const pass = prompt("Adja meg a belépési kódot:");
        if (pass === '7575') {
            localStorage.setItem('auth_id', btoa('7575'));
            location.reload();
        } else {
            alert("Hibás kód!");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

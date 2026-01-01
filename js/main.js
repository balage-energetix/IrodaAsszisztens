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
        this.initHeaderBgRotation();
        this.initWaveDirectionSwitcher();
        this.initInteractivity();
        console.log("Irodai Asszisztens V3.33 initialized");
    },

    // --- Wave Direction Switcher ---
    initWaveDirectionSwitcher() {
        setInterval(() => {
            document.body.classList.toggle('waves-reverse');
        }, 20000);
    },

    // --- Dynamic Header Background ---
    initHeaderBgRotation() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        let bgLayer = header.querySelector('.header-bg-layer');
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.className = 'header-bg-layer';
            header.prepend(bgLayer);
        }

        // Add overlay if missing
        if (!header.querySelector('.header-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'header-overlay';
            header.prepend(overlay);
        }

        const setFixedBg = () => {
            const p = this.getPath();
            const imgPath = `${p}pictures/(17).jpg`;

            const img = new Image();
            img.src = imgPath;
            img.onload = () => {
                bgLayer.innerHTML = `<img src="${img.src}" alt="Header background" style="width:100%; height:100%; object-fit:cover; filter:blur(2px) brightness(0.7);">`;
                bgLayer.style.opacity = '0.4';
            };
        };

        // Rotation disabled as per request
        setFixedBg();
    },

    // --- Global Navigation ---
    injectGlobalNav() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const p = window.location.pathname.includes('/modules/') ? (window.location.pathname.match(/\//g).length > 2 ? '../../' : '../') : '';

        // Force Android Icon and grass green branding
        const logo = header.querySelector('.logo');
        if (logo) {
            logo.innerHTML = `<i class="fab fa-android"></i><span>IRODAI<br>ASSZISZTENS</span>`;
        }

        const authTier = sessionStorage.getItem('auth_tier') || 'guest';
        const isAdmin = authTier === 'admin';

        const navHtml = `
            <button class="menu-toggle" onclick="App.toggleMobileMenu()"><i class="fas fa-bars"></i></button>
            <nav class="app-nav">
                <div class="nav-cat">MŰSZAKI ESZKÖZÖK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/map/index.html" class="nav-dropdown-item"><i class="fas fa-map-marked-alt" style="color:#4caf50;"></i> Térkép</a>
                        <a href="${p}modules/publiclight/index.html" class="nav-dropdown-item"><i class="fas fa-lightbulb" style="color:#fbc02d;"></i> Közvilágítás</a>
                        <a href="${p}modules/gallery/index.html" class="nav-dropdown-item"><i class="fas fa-images" style="color:#2196f3;"></i> Drónfelvételek</a>
                        <a href="${p}modules/tools/checklist.html" class="nav-dropdown-item"><i class="fas fa-clipboard-check" style="color:#ff9800;"></i> Check-lista</a>
                        <a href="${p}modules/tools/generator.html" class="nav-dropdown-item"><i class="fas fa-file-signature" style="color:#9c27b0;"></i> Nyomtatvány generátor</a>
                    </div>
                </div>
                <div class="nav-cat ${!isAdmin ? 'disabled-access' : ''}">ESZKÖZÖK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/tools/pdfeditor.html" class="nav-dropdown-item"><i class="fas fa-file-pdf" style="color:#d32f2f;"></i> PDF Szerkesztő</a>
                        <a href="${p}modules/tools/pdfreader.html" class="nav-dropdown-item"><i class="fas fa-book-open" style="color:#3f51b5;"></i> PDF Kiolvasó</a>
                        <a href="${p}modules/tools/speech.html" class="nav-dropdown-item"><i class="fas fa-volume-up" style="color:#9c27b0;"></i> Felolvasó</a>
                        <a href="${p}modules/tools/stt.html" class="nav-dropdown-item"><i class="fas fa-microphone" style="color:#e91e63;"></i> Hangfelismerő</a>
                        <a href="${p}modules/tools/deadlines.html" class="nav-dropdown-item"><i class="fas fa-calendar-check" style="color:#ff9800;"></i> Határidők</a>
                        <a href="${p}modules/utils/index.html" class="nav-dropdown-item"><i class="fas fa-bolt" style="color:#fbc02d;"></i> Gyorsító</a>
                        <a href="${p}modules/tools/notes.html" class="nav-dropdown-item"><i class="fas fa-sticky-note" style="color:#ffeb3b;"></i> Feljegyzés</a>
                        <a href="${p}modules/tools/weather_log.html" class="nav-dropdown-item"><i class="fas fa-cloud-sun" style="color:#03a9f4;"></i> Időjárás Napló</a>
                    </div>
                </div>
                <div class="nav-cat ${!isAdmin ? 'disabled-access' : ''}">ELSZÁMOLÁS <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/calc/index.html" class="nav-dropdown-item"><i class="fas fa-calculator" style="color:#2ecc71;"></i> Számlázási Segéd</a>
                        <a href="${p}modules/consumption/index.html" class="nav-dropdown-item"><i class="fas fa-building-circle-check" style="color:#16a085;"></i> Fogyasztási Helyek</a>
                        <a href="${p}modules/stocks/index.html" class="nav-dropdown-item"><i class="fas fa-chart-line" style="color:#ef5350;"></i> Tőzsde & Árak</a>
                    </div>
                </div>
                <div class="nav-cat ${!isAdmin ? 'disabled-access' : ''}">INFORMÁCIÓ <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/info/atadhir.html" class="nav-dropdown-item"><i class="fas fa-newspaper" style="color:#607d8b;"></i> Atádi Hírek</a>
                        <a href="${p}modules/info/local_weather.html" class="nav-dropdown-item"><i class="fas fa-temperature-high" style="color:#ff5722;"></i> Helyi Időjárás</a>
                        <a href="${p}modules/phonebook/index.html" class="nav-dropdown-item"><i class="fas fa-address-book" style="color:#795548;"></i> Telefonkönyv</a>
                        <a href="${p}modules/links/index.html" class="nav-dropdown-item"><i class="fas fa-link" style="color:#009688;"></i> Linkek</a>
                        <a href="${p}modules/viz/index.html" class="nav-dropdown-item"><i class="fas fa-chart-pie" style="color:#673ab7;"></i> Vizualizáció</a>
                    </div>
                </div>
                <div class="nav-cat">ISMERETEK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/info/public_admin.html" class="nav-dropdown-item"><i class="fas fa-university" style="color:#546e7a;"></i> Közigazgatás</a>
                        <a href="${p}modules/info/energetika.html" class="nav-dropdown-item"><i class="fas fa-charging-station" style="color:#ff9800;"></i> Energetika</a>
                        <a href="${p}modules/info/vibe_code.html" class="nav-dropdown-item"><i class="fas fa-terminal" style="color:#4caf50;"></i> Vájb Kód Bevezető</a>
                        <a href="${p}modules/lean/index.html" class="nav-dropdown-item"><i class="fas fa-keyboard" style="color:#9e9e9e;"></i> Gyorsbillentyűk</a>
                        <a href="${p}modules/tools/lean_office.html" class="nav-dropdown-item"><i class="fas fa-seedling" style="color:#4caf50;"></i> Irodai Lean</a>
                        <a href="${p}modules/tools/efficiency.html" class="nav-dropdown-item"><i class="fas fa-rocket" style="color:#ff5722;"></i> Hatékonyság</a>
                        <a href="${p}modules/videos/index.html" class="nav-dropdown-item"><i class="fas fa-play-circle" style="color:#f44336;"></i> Videótár</a>
                    </div>
                </div>
            </nav>
        `;

        // Remove old bits
        const oldNav = header.querySelector('.app-nav');
        if (oldNav) oldNav.remove();
        const oldToggle = header.querySelector('.menu-toggle');
        if (oldToggle) oldToggle.remove();

        const infoArea = header.querySelector('.header-info');
        if (infoArea) {
            header.insertBefore(document.createRange().createContextualFragment(navHtml), infoArea);

            // Restore/Update infoArea content
            infoArea.innerHTML = `
                <div class="info-wrapper" style="display: flex; align-items: center; gap: 1.5rem;">
                    <div class="weather-clock-group" style="display: flex; align-items: center; gap: 1rem; border-right: 1px solid var(--border-color); padding-right: 1.5rem; margin-right: 0.5rem;">
                        <div id="header-weather" style="text-align: right; line-height: 1.2; font-size: 0.85rem; font-weight: 600;"></div>
                        <div id="global-clock" style="text-align: right; line-height: 1.2; font-size: 0.85rem; color: var(--primary); font-weight: 700;"></div>
                    </div>
                    <div class="header-actions" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem;">
                        <button onclick="App.logout()" class="logout-btn" title="Kijelentkezés">
                            <i class="fas fa-sign-out-alt" style="color:#d32f2f;"></i>
                        </button>
                        <button onclick="App.toggleTheme()" style="background:none; border:none; font-size:1.1rem; color:var(--text-main); cursor:pointer;">
                            <i id="theme-toggle-icon" class="fas fa-moon" style="color:#fbc02d;"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Click-to-open logic for Dropdowns
        document.querySelectorAll('.nav-cat').forEach(cat => {
            cat.addEventListener('click', (e) => {
                if (e.target.closest('.nav-dropdown-item')) return;

                e.preventDefault();
                e.stopPropagation();
                const isActive = cat.classList.contains('active');
                document.querySelectorAll('.nav-cat').forEach(c => c.classList.remove('active'));
                if (!isActive) cat.classList.add('active');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-cat')) {
                document.querySelectorAll('.nav-cat').forEach(c => c.classList.remove('active'));
            }
        });

        // Inject standardized back button in modules sub-header
        if (window.location.pathname.includes('/modules/')) {
            const container = document.querySelector('main.container') || document.querySelector('main.container-fluid');
            if (container) {
                const subBar = document.createElement('div');
                subBar.className = 'sub-nav-bar';
                subBar.innerHTML = `<a href="${p}index.html" class="back-btn"><i class="fas fa-arrow-left"></i> VISSZA A MŰSZERFALRA</a>`;
                // Add title to sub-bar if possible
                const h2 = document.querySelector('h2');
                if (h2) {
                    const titleWrap = document.createElement('div');
                    titleWrap.style.marginLeft = '2rem';
                    titleWrap.style.fontWeight = '800';
                    titleWrap.style.fontSize = '0.9rem';
                    titleWrap.innerText = h2.innerText;
                    subBar.appendChild(titleWrap);
                }
                container.parentNode.insertBefore(subBar, container);
            }
        }
    },

    getPath() {
        const path = window.location.pathname;
        if (path.includes('/modules/')) {
            const parts = path.split('/modules/')[1].split('/');
            // If parts length is 1 (e.g. tools.html), we need '../'
            // If parts length is 2 (e.g. map/index.html), we need '../../'
            return '../'.repeat(parts.length);
        }
        return '';
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
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.state.location.lat}&longitude=${this.state.location.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=sunrise,sunset&timezone=auto`);
            const data = await res.json();

            // Update Header Weather
            const weatherEl = document.getElementById('header-weather');
            if (weatherEl && data.current) {
                const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                weatherEl.innerHTML = `
                    <div style="font-weight:800; font-size:0.9rem;"><i class="fas fa-temperature-high" style="color:#ff5722;"></i> ${Math.round(data.current.temperature_2m)}°C</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);"><i class="fas fa-sun" style="color:#fbc02d;"></i> ${sunrise} | <i class="fas fa-moon" style="color:#3f51b5;"></i> ${sunset}</div>
                `;
            }

            // Sync with Local Weather Module elements
            const tempVal = document.getElementById('weather-temp');
            const windVal = document.getElementById('weather-wind');
            const humidVal = document.getElementById('weather-humid');
            const pressVal = document.getElementById('weather-press');

            if (tempVal) tempVal.innerText = `${Math.round(data.current.temperature_2m)}°C`;
            if (windVal) windVal.innerText = `${Math.round(data.current.wind_speed_10m)} km/h`;
            if (humidVal) humidVal.innerText = `${data.current.relative_humidity_2m}%`;
            if (pressVal) pressVal.innerText = `${Math.round(data.current.surface_pressure)} hPa`;

        } catch (e) { console.error("Weather Sync Error:", e); }
    },

    initSearch() {
        const searchInput = document.getElementById('dashboard-search');
        if (!searchInput) return;

        const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        searchInput.addEventListener('input', (e) => {
            const q = normalize(e.target.value);
            document.querySelectorAll('.feature-card').forEach(card => {
                const titleEl = card.querySelector('h5');
                if (!titleEl) return;
                const title = normalize(titleEl.innerText);
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

    // --- Custom Modal System ---
    showModal({ title, placeholder, initialValue = '', inputType = 'text', callback }) {
        const modalId = 'custom-modal-' + Date.now();
        const modalHtml = `
            <div id="${modalId}" class="custom-modal-overlay">
                <div class="custom-modal-content">
                    <h3>${title}</h3>
                    <input type="${inputType}" id="${modalId}-input" value="${initialValue}" placeholder="${placeholder}" autofocus>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" onclick="document.getElementById('${modalId}').remove()">Mégse</button>
                        <button class="modal-btn primary" id="${modalId}-confirm">Megerősítés</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const input = document.getElementById(`${modalId}-input`);
        const confirmBtn = document.getElementById(`${modalId}-confirm`);

        const doCallback = () => {
            const val = input.value.trim();
            document.getElementById(modalId).remove();
            if (callback) callback(val);
        };

        confirmBtn.onclick = doCallback;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') doCallback();
            if (e.key === 'Escape') document.getElementById(modalId).remove();
        };
        input.focus();
    },

    checkLogin() {
        const authId = sessionStorage.getItem('auth_id');
        const authTier = sessionStorage.getItem('auth_tier');

        if (authId === btoa('7575')) {
            this.state.user = { name: 'Admin', tier: 'admin' };
        } else if (authId === btoa('7474')) {
            this.state.user = { name: 'Vendég', tier: 'guest' };
        } else {
            this.state.user = null;
        }

        const apply = () => {
            const overlay = document.getElementById('auth-overlay');
            const main = document.getElementById('app-main');
            if (!overlay || !main) return;

            if (this.state.user) {
                overlay.style.display = 'none';
                main.style.display = 'block';
                document.body.classList.add('authenticated');
                this.applyVisibilityFilters();
            } else {
                overlay.style.display = 'flex';
                main.style.display = 'none';
                document.body.classList.remove('authenticated');
            }
        };

        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', apply);
        } else {
            apply();
        }
    },

    applyVisibilityFilters() {
        if (!this.state.user || this.state.user.tier === 'admin') return;

        // Gray out restricted sections on dashboard
        document.querySelectorAll('.category-group').forEach(group => {
            const title = group.querySelector('.group-title').innerText.toLowerCase();
            if (title.includes('eszközök') || title.includes('információ')) {
                group.classList.add('disabled-access');
            }
        });
    },

    login() {
        const input = document.getElementById('auth-password-input');
        if (!input) return;

        const pass = input.value;
        if (pass === '7575') {
            sessionStorage.setItem('auth_id', btoa('7575'));
            sessionStorage.setItem('auth_tier', 'admin');
            location.reload();
        } else if (pass === '7474') {
            sessionStorage.setItem('auth_id', btoa('7474'));
            sessionStorage.setItem('auth_tier', 'guest');
            location.reload();
        } else if (pass) {
            alert('Hibás kód!');
            input.value = '';
            input.focus();
        }
    },

    logout() {
        sessionStorage.clear();
        const p = this.getPath();
        window.location.href = `${p}index.html`;
    },

    toggleMobileMenu() {
        const nav = document.querySelector('.app-nav');
        if (nav) nav.classList.toggle('active');
    },

    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s ease forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// Global Enter listener for login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('auth-password-input');
        if (input && document.activeElement === input) {
            App.login();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => App.init());

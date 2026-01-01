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

        const droneImages = Array.from({ length: 28 }, (_, i) => `pictures/(${i + 1}).jpg`);

        const changeBg = () => {
            const randomImg = droneImages[Math.floor(Math.random() * droneImages.length)];
            const isModule = window.location.pathname.includes('/modules/');
            const isDeepModule = (window.location.pathname.match(/\//g) || []).length > 2;
            let relativePath = '';
            if (isDeepModule) relativePath = '../../';
            else if (isModule) relativePath = '../';

            // Fix for root index.html
            if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                relativePath = '';
            }

            bgLayer.style.opacity = '0';
            setTimeout(() => {
                bgLayer.innerHTML = `<img src="${relativePath}${randomImg}" alt="Header background">`;
                bgLayer.style.opacity = '0.25';
            }, 1500);
        };

        setInterval(changeBg, 20000);
        changeBg();
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
                        <a href="${p}modules/map/index.html" class="nav-dropdown-item"><i class="fas fa-map-marked-alt"></i> Térkép</a>
                        <a href="${p}modules/publiclight/index.html" class="nav-dropdown-item"><i class="fas fa-lightbulb"></i> Közvilágítás</a>
                        <a href="${p}modules/gallery/index.html" class="nav-dropdown-item"><i class="fas fa-images"></i> Drónfelvételek</a>
                        <a href="${p}modules/tools/checklist.html" class="nav-dropdown-item"><i class="fas fa-clipboard-check"></i> Check-lista</a>
                        <a href="${p}modules/tools/generator.html" class="nav-dropdown-item"><i class="fas fa-file-signature"></i> Nyomtatvány generátor</a>
                        <a href="${p}modules/stocks/index.html" class="nav-dropdown-item"><i class="fas fa-chart-line"></i> Tőzsde</a>
                    </div>
                </div>
                <div class="nav-cat ${!isAdmin ? 'disabled-access' : ''}">ESZKÖZÖK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/tools/pdfeditor.html" class="nav-dropdown-item"><i class="fas fa-file-pdf"></i> PDF Szerkesztő</a>
                        <a href="${p}modules/tools/pdfreader.html" class="nav-dropdown-item"><i class="fas fa-book-open"></i> PDF Kiolvasó</a>
                        <a href="${p}modules/utils/index.html" class="nav-dropdown-item"><i class="fas fa-bolt"></i> Gyorsító</a>
                        <a href="${p}modules/tools/notes.html" class="nav-dropdown-item"><i class="fas fa-sticky-note"></i> Feljegyzés</a>
                        <a href="${p}modules/tools/weather_log.html" class="nav-dropdown-item"><i class="fas fa-cloud-sun"></i> Időjárás Napló</a>
                    </div>
                </div>
                <div class="nav-cat ${!isAdmin ? 'disabled-access' : ''}">INFORMÁCIÓ <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/info/atadhir.html" class="nav-dropdown-item"><i class="fas fa-newspaper"></i> Atádi Hírek</a>
                        <a href="${p}modules/info/local_weather.html" class="nav-dropdown-item"><i class="fas fa-temperature-high"></i> Helyi Időjárás</a>
                        <a href="${p}modules/phonebook/index.html" class="nav-dropdown-item"><i class="fas fa-address-book"></i> Telefonkönyv</a>
                        <a href="${p}modules/links/index.html" class="nav-dropdown-item"><i class="fas fa-link"></i> Linkek</a>
                        <a href="${p}modules/viz/index.html" class="nav-dropdown-item"><i class="fas fa-chart-pie"></i> Vizualizáció</a>
                    </div>
                </div>
                <div class="nav-cat">ISMERETEK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/info/public_admin.html" class="nav-dropdown-item"><i class="fas fa-university"></i> Közigazgatás</a>
                        <a href="${p}modules/info/energetika.html" class="nav-dropdown-item"><i class="fas fa-charging-station"></i> Energetika</a>
                        <a href="${p}modules/lean/index.html" class="nav-dropdown-item"><i class="fas fa-keyboard"></i> Gyorsbillentyűk</a>
                        <a href="${p}modules/tools/lean_office.html" class="nav-dropdown-item"><i class="fas fa-seedling"></i> Irodai Lean</a>
                        <a href="${p}modules/tools/efficiency.html" class="nav-dropdown-item"><i class="fas fa-rocket"></i> Hatékonyság</a>
                        <a href="${p}modules/videos/index.html" class="nav-dropdown-item"><i class="fas fa-play-circle"></i> Videótár</a>
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
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                        <button onclick="App.toggleTheme()" style="background:none; border:none; font-size:1.1rem; color:var(--text-main); cursor:pointer;">
                            <i id="theme-toggle-icon" class="fas fa-moon"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Click-to-open logic for Dropdowns
        document.querySelectorAll('.nav-cat').forEach(cat => {
            cat.addEventListener('click', (e) => {
                // If the click is on a link inside the dropdown, do NOT toggle parent
                if (e.target.closest('.nav-cat-dropdown')) return;

                e.stopPropagation();
                const isActive = cat.classList.contains('active');
                document.querySelectorAll('.nav-cat').forEach(c => c.classList.remove('active'));
                if (!isActive) cat.classList.add('active');
            });
        });

        // Close when clicking outside
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
                    <div style="font-weight:800; font-size:0.9rem;"><i class="fas fa-temperature-high"></i> ${Math.round(data.current.temperature_2m)}°C</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);"><i class="fas fa-sun"></i> ${sunrise} | <i class="fas fa-moon"></i> ${sunset}</div>
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

        window.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('auth-overlay');
            const main = document.getElementById('app-main');
            if (!overlay || !main) return;

            if (this.state.user) {
                overlay.style.display = 'none';
                main.style.display = 'block';
                this.applyVisibilityFilters();
            } else {
                overlay.style.display = 'flex';
                main.style.display = 'none';
            }
        });
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
        location.reload();
    },

    toggleMobileMenu() {
        const nav = document.querySelector('.app-nav');
        if (nav) nav.classList.toggle('active');
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

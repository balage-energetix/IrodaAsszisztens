/**
 * Irodai Asszisztens - Global Core Logic (Phase 3)
 */

const App = {
    state: {
        user: JSON.parse(localStorage.getItem('auth_user')),
        theme: localStorage.getItem('theme') || 'light',
        bgColor: localStorage.getItem('bg-color') || '#f5f5f5',
        location: { lat: 46.229, lon: 17.365, name: 'Nagyatád' },
        version: "V3.43",
        droneIndex: 1,
        isIdle: false,
        powerAlert: false
    },

    init() {
        window.scrollTo(0, 0);
        this.checkLogin();
        this.applyTheme();
        this.applyBgColor();
        this.initClock();
        this.fetchWeather();
        this.injectGlobalNav();
        this.initSearch();
        this.initHeaderBgRotation();
        this.initInteractivity();
        this.initMonitoring();
        this.initIdleDetection();
        this.initEntryAnimations();
        this.checkPowerDeadlines();
        console.log("Irodai Asszisztens V3.44 initialized (Fast Mode)");
        document.body.classList.add('ready');
    },

    initIdleDetection() {
        let timer;
        const resetTimer = () => {
            this.state.isIdle = false;
            clearTimeout(timer);
            timer = setTimeout(() => this.state.isIdle = true, 30000); // 30s idle
        };
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        resetTimer();
    },

    // --- Wave Direction Switcher removed ---

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
            // Background image injection disabled for a cleaner look
            bgLayer.style.background = 'linear-gradient(135deg, #0a1142 0%, #1a237e 50%, #050a10 100%)';
            bgLayer.style.opacity = '1';
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
            const alertHtml = this.state.powerAlert ? '<div class="header-alert-badge" title="Bejelentési határidő közeleg!">!</div>' : '';
            logo.innerHTML = `<div style="position:relative; display:inline-block;">
                <i class="fab fa-android" style="color:var(--accent-purple) !important;"></i>
                ${alertHtml}
            </div><span style="color:var(--accent-purple) !important;">IRODAI<br>ASSZISZTENS</span>`;
        }

        const authTier = sessionStorage.getItem('auth_tier') || 'guest';
        const isAdmin = authTier === 'admin';

        const navHtml = `
            <button class="menu-toggle" onclick="App.toggleMobileMenu()"><i class="fas fa-bars"></i></button>
            <nav class="app-nav">
                <div class="nav-cat">ENERGETIKA <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/tools/gas_evaluator.html" class="nav-dropdown-item"><i class="fas fa-file-invoice-dollar" style="color:#fbc02d;"></i> Gázárajánlat kiértékelő</a>
                        <a href="${p}modules/tools/energy_reports.html" class="nav-dropdown-item"><i class="fas fa-solar-panel" style="color:#d4af37;"></i> Energetikai Riportok <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                        <a href="${p}modules/tools/power_optimizer.html" class="nav-dropdown-item"><i class="fas fa-chart-line" style="color:#f44336;"></i> Teljesítmény Optimalizáló <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                        <a href="${p}modules/info/geothermal.html" class="nav-dropdown-item"><i class="fas fa-hot-tub" style="color:#ff5722;"></i> Geotermális fűtés</a>
                        <a href="${p}modules/registers/index.html" class="nav-dropdown-item"><i class="fas fa-database" style="color:#2196f3;"></i> Nyilvántartások <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                        <a href="${p}modules/tools/power_overrun_scheduler.html" class="nav-dropdown-item"><i class="fas fa-calendar-alt" style="color:#ff5722;"></i> Teljesítménytúllépés ütemező <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                    </div>
                </div>
                <div class="nav-cat">TÉRKÉPEK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/map/index.html" class="nav-dropdown-item"><i class="fas fa-map-marked-alt" style="color:#4caf50;"></i> Probléma térkép</a>
                        <a href="${p}modules/publiclight/index.html" class="nav-dropdown-item"><i class="fas fa-lightbulb" style="color:#fbc02d;"></i> Közvilágítási térkép</a>
                    </div>
                </div>
                <div class="nav-cat">MŰSZAKI ESZKÖZÖK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/tech/meter_readings.html" class="nav-dropdown-item disabled-access"><i class="fas fa-gauge-high" style="color:#9c27b0;"></i> Mérőállás Rögzítő</a>
                        <a href="${p}modules/tools/checklist.html" class="nav-dropdown-item"><i class="fas fa-clipboard-check" style="color:#ff9800;"></i> Check-lista</a>
                        <a href="${p}modules/info/message_board.html" class="nav-dropdown-item"><i class="fas fa-bullhorn" style="color:#ff4081;"></i> Üzenőfal</a>
                        <a href="${p}modules/tech/notebooklm_intro.html" class="nav-dropdown-item"><i class="fas fa-robot" style="color:#4285f4;"></i> NotebookLM</a>
                    </div>
                </div>
                <div class="nav-cat">ESZKÖZÖK <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/tools/pdfeditor.html" class="nav-dropdown-item"><i class="fas fa-file-pdf" style="color:#d32f2f;"></i> PDF Szerkesztő</a>
                        <a href="${p}modules/tools/pdfreader.html" class="nav-dropdown-item"><i class="fas fa-book-open" style="color:#3f51b5;"></i> PDF kinyerő</a>
                        <a href="${p}modules/tools/generator.html" class="nav-dropdown-item"><i class="fas fa-file-signature" style="color:#9c27b0;"></i> Nyomtatvány generátor</a>
                        <a href="${p}modules/gallery/index.html" class="nav-dropdown-item"><i class="fas fa-images" style="color:#2196f3;"></i> Drón fotók</a>
                        <a href="${p}modules/tools/speech.html" class="nav-dropdown-item"><i class="fas fa-volume-up" style="color:#9c27b0;"></i> Szöveg Felolvasó</a>
                        <a href="${p}modules/tools/stt.html" class="nav-dropdown-item"><i class="fas fa-microphone" style="color:#e91e63;"></i> Beszéd írnok</a>
                        <a href="${p}modules/tools/deadlines.html" class="nav-dropdown-item"><i class="fas fa-calendar-check" style="color:#ff9800;"></i> Határidők</a>
                        <a href="${p}modules/utils/index.html" class="nav-dropdown-item"><i class="fas fa-bolt" style="color:#fbc02d;"></i> Gyorsító Eszközök</a>
                        <a href="${p}modules/tools/notes.html" class="nav-dropdown-item"><i class="fas fa-sticky-note" style="color:#ffee58;"></i> Gyors Feljegyzés</a>
                        <a href="${p}modules/tools/translator.html" class="nav-dropdown-item"><i class="fas fa-language" style="color:#4caf50;"></i> Fordító Segéd</a>
                    </div>
                </div>
                <div class="nav-cat">ELSZÁMOLÁS <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/calc/contracts.html" class="nav-dropdown-item"><i class="fas fa-file-contract" style="color:#e67e22;"></i> Szerződés Nyilvántartó</a>
                        <a href="${p}modules/calc/hupx_calc.html" class="nav-dropdown-item"><i class="fas fa-calculator" style="color:#4caf50;"></i> Energiaszámla kalkulátor</a>
                        <a href="${p}modules/calc/index.html" class="nav-dropdown-item"><i class="fas fa-file-invoice-dollar" style="color:#d32f2f;"></i> Számlázási Segéd</a>
                        <a href="${p}modules/calc/budget_planner.html" class="nav-dropdown-item"><i class="fas fa-file-invoice-dollar" style="color:#3498db;"></i> Költségvetési tervező</a>
                        <a href="${p}modules/tenants/index.html" class="nav-dropdown-item"><i class="fas fa-file-invoice" style="color:#e91e63;"></i> Bérlői elszámolások</a>
                        <a href="${p}modules/tools/heating.html" class="nav-dropdown-item"><i class="fas fa-temperature-arrow-up" style="color:#d32f2f;"></i> Fűtésvezérlés</a>
                        <a href="${p}modules/polc/index.html" class="nav-dropdown-item"><i class="fas fa-microchip" style="color:#2196f3;"></i> POLC Online</a>
                        <a href="${p}modules/consumption/index.html" class="nav-dropdown-item"><i class="fas fa-building-circle-check" style="color:#4caf50;"></i> Fogyasztási Helyek</a>
                        <a href="${p}modules/stocks/index.html" class="nav-dropdown-item"><i class="fas fa-chart-line" style="color:#fbc02d;"></i> Tőzsdei Árak</a>
                    </div>
                </div>
                <div class="nav-cat">INFORMÁCIÓ <i class="fas fa-chevron-down ms-1" style="font-size:0.7rem;"></i>
                    <div class="nav-cat-dropdown">
                        <a href="${p}modules/info/local_weather.html" class="nav-dropdown-item"><i class="fas fa-temperature-high" style="color:#ff5722;"></i> Helyi Időjárás <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                        <a href="${p}modules/tools/weather_log.html" class="nav-dropdown-item"><i class="fas fa-cloud-sun" style="color:#03a9f4;"></i> Időjárás Napló <i class="fas fa-check-circle ms-1" style="color:#4caf50; font-size:0.7rem;"></i></a>
                        <a href="${p}modules/info/atadhir.html" class="nav-dropdown-item"><i class="fas fa-newspaper" style="color:#607d8b;"></i> Atádi Hírek</a>
                        <a href="${p}modules/info/nagyatad_presentation.html" class="nav-dropdown-item"><i class="fas fa-city" style="color:#2e7d32;"></i> Nagyatád bemutató</a>
                        <a href="${p}modules/info/procedures.html" class="nav-dropdown-item"><i class="fas fa-project-diagram" style="color:#673ab7;"></i> Ügymenetek</a>
                        <a href="${p}modules/info/help.html" class="nav-dropdown-item"><i class="fas fa-question-circle" style="color:#009688;"></i> Súgó</a>
                        <a href="${p}modules/phonebook/index.html" class="nav-dropdown-item"><i class="fas fa-address-book" style="color:#795548;"></i> Telefonkönyv</a>
                        <a href="${p}modules/links/index.html" class="nav-dropdown-item"><i class="fas fa-link" style="color:#009688;"></i> Linkgyűjtemény</a>
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
                        <a href="${p}modules/videos/index.html" class="nav-dropdown-item disabled-access"><i class="fas fa-play-circle" style="color:#f44336;"></i> Videótár</a>
                        <a href="${p}modules/info/regulations.html" class="nav-dropdown-item"><i class="fas fa-gavel" style="color:#546e7a;"></i> Vonatkozó rendeletek</a>
                        <a href="${p}modules/tools/iso50001.html" class="nav-dropdown-item"><i class="fas fa-leaf" style="color:#4caf50;"></i> EIR ISO (ISO 50001)</a>
                        <a href="${p}modules/tools/relax_center.html" class="nav-dropdown-item"><i class="fas fa-mug-hot" style="color:#ffcc33;"></i> Relax Center</a>
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
                        <div id="header-weather" style="text-align: right; line-height: 1.1; font-size: 0.85rem; font-weight: 600; display: flex; flex-direction: column; justify-content: center;"></div>
                        <div id="global-clock" style="text-align: right; line-height: 1.1; font-size: 0.85rem; color: var(--accent-purple); font-weight: 700; text-shadow: 0 0 10px rgba(123, 97, 255, 0.3); display: flex; flex-direction: column; justify-content: center;"></div>
                    </div>
                    <div class="header-actions" style="display: flex; flex-direction: column; align-items: center; gap: 0.8rem;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
                            <span style="font-size: 0.55rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; line-height: 1;">KILÉP</span>
                            <button onclick="App.logout()" class="logout-btn" title="Kijelentkezés" style="padding:0; background:none; border:none; cursor:pointer;">
                                <i class="fas fa-sign-out-alt" style="color:#7b61ff; font-size:1.1rem;"></i>
                            </button>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
                            <button onclick="App.toggleTheme()" style="background:none; border:none; font-size:1.1rem; color:var(--text-main); cursor:pointer; padding:0;">
                                <i id="theme-toggle-icon" class="fas fa-moon" style="color:var(--accent-purple);"></i>
                            </button>
                            <span id="theme-toggle-label" style="font-size: 0.55rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; line-height: 1;">ÉJJELI</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Unified dropdown logic
        header.querySelectorAll('.nav-cat').forEach(cat => {
            const toggle = () => {
                header.querySelectorAll('.nav-cat').forEach(c => { if (c !== cat) c.classList.remove('active'); });
                cat.classList.toggle('active');
                // Explicitly manage display for mobile
                const dropdown = cat.querySelector('.nav-cat-dropdown');
                if (dropdown && window.innerWidth <= 992) {
                    dropdown.style.display = cat.classList.contains('active') ? 'flex' : 'none';
                }
            };

            cat.onclick = (e) => {
                // If on mobile, ANY click on the category row (that isn't a direct link click) toggles it
                if (window.innerWidth <= 992) {
                    if (e.target.closest('.nav-dropdown-item')) return;

                    e.preventDefault();
                    e.stopPropagation();
                    toggle();
                }
            };

            // Allow hover on desktop, but click for mobile
            cat.onmouseenter = () => { if (window.innerWidth > 992) cat.classList.add('active'); };
            cat.onmouseleave = () => { if (window.innerWidth > 992) cat.classList.remove('active'); };
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
        const label = document.getElementById('theme-toggle-label');
        if (label) label.innerText = this.state.theme === 'light' ? 'ÉJJELI' : 'NAPPALI';
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
        const uniqueIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 37, 39, 40, 41, 42, 43, 44, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 61, 63, 64, 67, 68, 69, 70, 71, 72, 73, 75, 77, 79, 81, 82, 83, 84, 85];
        const update = () => {
            const randIdx = Math.floor(Math.random() * uniqueIndices.length);
            const rand = uniqueIndices[randIdx];
            const imgUrl = `url('${p}pictures/(${rand}).jpg')`;
            document.documentElement.style.setProperty('--bg-drone', imgUrl);
        };
        update();
        setInterval(update, 60000); // 1 minute rotation
    },

    // --- Cursor Follower removed ---

    initStars() {
        // Star effect removed for performance
    },

    initInteractivity() {
        // Interactivity (flashlight/cursor effects) removed as per request
    },

    initFlashlight() {
        // Obsolete - Replaced by initCursor
    },

    // --- Core Features ---
    initClock() {
        const days = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
        const update = () => {
            const now = new Date();
            const clockEl = document.getElementById('global-clock');
            if (clockEl) {
                clockEl.innerHTML = `
                    <div class="clock-time" style="color:var(--accent-purple); font-family:monospace; font-weight:800; font-size:1.1rem;">${now.toLocaleTimeString('hu-HU')}</div>
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
        <div style="font-weight:900; font-size:1.1rem; color:var(--accent-purple); text-shadow: 0 0 8px rgba(123, 97, 255, 0.2); margin-bottom: 2px;">
            <i class="fas fa-temperature-low" style="margin-right: 2px;"></i>${Math.round(data.current.temperature_2m)}°C
        </div>
                    <div style="font-size:0.65rem; color:var(--text-muted); font-weight:800; display: flex; align-items: center; justify-content: flex-end; gap: 6px; letter-spacing: 0.02em;">
                        <span><i class="fas fa-sun" style="color:var(--accent-purple); opacity: 0.8; font-size: 0.6rem;"></i> ${sunrise}</span>
                        <span style="opacity: 0.3;">|</span>
                        <span><i class="fas fa-moon" style="color:var(--accent-purple); opacity: 0.8; font-size: 0.6rem;"></i> ${sunset}</span>
                    </div>
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
                const isMatch = q !== "" && title.includes(q);

                card.style.display = (q === "" || isMatch) ? 'flex' : 'none';

                // Pulsing glow for hits
                if (isMatch) card.classList.add('search-glow');
                else card.classList.remove('search-glow');
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
            this.notify('Hibás kód!', 'error');
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
        this.notify(message, type);
    },

    notify(message, type = 'info') {
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
        toast.innerHTML = `<i class="fas ${icon}"></i><span class="toast-message">${message}</span>`;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s ease forwards';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    },

    async initMonitoring() {
        const chartEl = document.getElementById('daily-temp-chart');
        const avgEl = document.getElementById('three-day-avg');
        const forecastItemsEl = document.getElementById('forecast-items');
        if (!chartEl && !avgEl && !forecastItemsEl) return;

        try {
            // Fetch 7 days history + 3 days forecast
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.state.location.lat}&longitude=${this.state.location.lon}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=7&forecast_days=3`);
            const data = await res.json();

            if (data && data.daily) {
                const allValues = data.daily.temperature_2m_mean;
                // Last 7 days including today (usually from index 0 to 7 in this request)
                // Open-Meteo returns past_days + forecast_days. 
                // Index 7 is today.
                const pastValues = allValues.slice(0, 8);
                const pastLabels = data.daily.time.slice(0, 8);

                // 1. Chart Rendering (7-Day Trend)
                if (chartEl && typeof Chart !== 'undefined') {
                    const ctx = chartEl.getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: pastLabels,
                            datasets: [{
                                data: pastValues,
                                borderColor: '#7b61ff',
                                backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(0, 0, 0, 35);
                                    gradient.addColorStop(0, 'rgba(123, 97, 255, 0.2)');
                                    gradient.addColorStop(1, 'rgba(123, 97, 255, 0)');
                                    return gradient;
                                },
                                fill: true,
                                tension: 0.4,
                                borderWidth: 2,
                                pointRadius: 4,
                                pointBackgroundColor: (context) => {
                                    const val = context.raw;
                                    if (val <= 0) return '#2196f3'; // Deep Blue
                                    if (val < 10) return '#bbdefb'; // Light Blue
                                    if (val < 20) return '#fbc02d'; // Yellow/Orange
                                    return '#ff4d4d'; // Red
                                },
                                pointBorderColor: 'rgba(255,255,255,0.5)',
                                pointBorderWidth: 1,
                                pointHoverRadius: 6,
                                hitRadius: 25
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { intersect: false, mode: 'index' },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    padding: 8,
                                    yAlign: 'bottom',
                                    titleFont: { size: 10, weight: 'bold' },
                                    bodyFont: { size: 9 },
                                    callbacks: {
                                        title: (context) => `${context[0].parsed.y.toFixed(1)}°C`,
                                        label: (context) => pastLabels[context.dataIndex]
                                    }
                                }
                            },
                            scales: { x: { display: false }, y: { display: false } },
                            layout: { padding: { left: 0, right: 0, top: 2, bottom: 2 } }
                        }
                    });
                }

                // 2. 3-Day Average Calculation (Past 3 days)
                if (avgEl) {
                    const last3 = allValues.slice(5, 8); // index 5, 6, 7 (past 2 + today)
                    const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
                    avgEl.innerText = `${avg.toFixed(1)}°C`;
                }

                // 3. 3-Day Forecast Rendering (Today + Next 2 days)
                if (forecastItemsEl) {
                    forecastItemsEl.innerHTML = '';
                    const days = ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'];

                    for (let i = 0; i < 3; i++) {
                        const idx = 7 + i; // Start from today
                        const date = new Date(data.daily.time[idx]);
                        const dayName = i === 0 ? 'Ma' : days[date.getDay()];
                        const min = Math.round(data.daily.temperature_2m_min[idx]);
                        const max = Math.round(data.daily.temperature_2m_max[idx]);
                        const code = data.daily.weathercode[idx];
                        const icon = this.getWeatherIcon(code);

                        const item = document.createElement('div');
                        item.style.cssText = "display:flex; flex-direction:column; align-items:center; line-height:1; gap:2px;";
                        item.innerHTML = `
                            <span style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${dayName}</span>
                            <i class="${icon}" style="font-size:0.9rem; color:var(--accent-purple);"></i>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--text-main);">${min}/${max}°C</span>
                        `;
                        forecastItemsEl.appendChild(item);
                    }
                }

                console.log("Monitoring and Forecast data updated.");
            }
        } catch (e) {
            console.error("Monitoring Init Error:", e);
            if (avgEl) avgEl.innerText = "N/A";
            if (forecastItemsEl) forecastItemsEl.innerText = "N/A";
        }
    },

    getWeatherIcon(code) {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return 'fas fa-sun'; // Clear sky
        if (code >= 1 && code <= 3) return 'fas fa-cloud-sun'; // Main sky
        if (code >= 45 && code <= 48) return 'fas fa-smog'; // Fog
        if (code >= 51 && code <= 55) return 'fas fa-cloud-rain'; // Drizzle
        if (code >= 61 && code <= 65) return 'fas fa-cloud-showers-heavy'; // Rain
        if (code >= 71 && code <= 77) return 'fas fa-snowflake'; // Snow
        if (code >= 80 && code <= 82) return 'fas fa-cloud-showers-water'; // Rain showers
        if (code >= 95 && code <= 99) return 'fas fa-bolt-lightning'; // Thunderstorm
        return 'fas fa-cloud'; // Default
    },

    checkPowerDeadlines() {
        const now = new Date();
        const year = now.getFullYear();

        // Deadlines: May 31 (Strand) and Sept 30 (Others)
        const deadlines = [
            { name: 'Strandfürdő', date: new Date(year, 4, 31) }, // May 31
            { name: 'KIF3 Intézmények', date: new Date(year, 8, 30) } // Sept 30
        ];

        let hasPending = false;
        deadlines.forEach(d => {
            const diffDays = Math.ceil((d.date - now) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 14) {
                hasPending = true;
            }
        });

        if (hasPending) {
            this.state.powerAlert = true;
            // Re-inject nav to show icon if it was already injected
            this.injectGlobalNav();
        }
    },

    initEntryAnimations() {
        // Animations simplified to immediate display
        const logo = document.querySelector('.logo');
        const headerInfo = document.querySelector('.header-info');

        if (logo) logo.style.opacity = '1';
        if (headerInfo) headerInfo.style.opacity = '1';

        const cards = document.querySelectorAll('.feature-card, .relax-card, .pro-card, .summary-box');
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });

        const titles = document.querySelectorAll('.section-title, .group-title');
        titles.forEach(title => {
            title.style.opacity = '1';
            title.style.transform = 'none';
        });
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

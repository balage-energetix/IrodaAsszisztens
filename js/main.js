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
        this.initMonitoring();
        this.checkPowerDeadlines();
        console.log("Irodai Asszisztens V3.50 (Minimalist) initialized");
        setTimeout(() => {
            document.body.classList.add('ready');
            this.initEntryAnimations();
        }, 100);
    },

    // --- Visual Effects Disabled in Minimalist Mode ---
    initStars() {},
    initInteractivity() {},
    initFlashlight() {},
    initIdleDetection() {},
    initHeaderBgRotation() {
        const header = document.querySelector('.app-header');
        if (header) {
            header.style.background = 'var(--bg-card)';
        }
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
        // Simplified Minimalist Entry: Universal Fade
        const app = document.getElementById('app-main');
        if (app) {
            app.style.opacity = '0';
            app.style.transition = 'opacity 0.6s ease';
            requestAnimationFrame(() => app.style.opacity = '1');
        }
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

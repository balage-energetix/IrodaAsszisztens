/**
 * Irodai Asszisztens - Global Core Logic (V3.60 - Optimized)
 */

const App = {
    state: {
        user: null,
        theme: localStorage.getItem('theme') || 'light',
        location: { lat: 46.229, lon: 17.365 },
        version: 'V3.60',
        powerAlert: false
    },

    init() {
        this.checkLogin();
        this.applyTheme();
        this.initClock();
        this.injectGlobalNav();
        this.initSearch();
        this.fetchWeather();
        this.initMonitoring();
        this.checkPowerDeadlines();
        
        requestAnimationFrame(() => {
            document.body.classList.add('ready');
        });
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.applyTheme();
        this.injectGlobalNav(); // Refresh icons
    },

    initClock() {
        const days = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'];
        const update = () => {
            const el = document.getElementById('global-clock');
            if (!el) return;
            const now = new Date();
            el.innerHTML = `<div class="clock-time">${now.toLocaleTimeString('hu-HU')}</div><div class="clock-date">${now.toLocaleDateString('hu-HU')}, ${days[now.getDay()]}</div>`;
        };
        setInterval(update, 1000);
        update();
    },

    async fetchWeather() {
        try {
            const { lat, lon } = this.state.location;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,surface_pressure&daily=sunrise,sunset&timezone=auto`);
            const data = await res.json();
            if (!data.current) return;

            const weatherEl = document.getElementById('header-weather');
            if (weatherEl) {
                const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                const sunset  = new Date(data.daily.sunset[0]).toLocaleTimeString('hu-HU',  { hour: '2-digit', minute: '2-digit' });
                weatherEl.innerHTML = `
                    <div class="hw-temp"><i class="fas fa-temperature-low"></i>${Math.round(data.current.temperature_2m)}°C</div>
                    <div class="hw-sub"><i class="fas fa-sun"></i>${sunrise} <span>|</span> <i class="fas fa-moon"></i>${sunset}</div>`;
            }
        } catch (e) {}
    },

    async initMonitoring() {
        const chartEl = document.getElementById('daily-temp-chart');
        const avgEl   = document.getElementById('three-day-avg');
        const fcEl    = document.getElementById('forecast-items');
        if (!chartEl && !avgEl && !fcEl) return;

        try {
            const { lat, lon } = this.state.location;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=7&forecast_days=3`);
            const data = await res.json();
            if (!data.daily) return;

            const all   = data.daily.temperature_2m_mean;
            const past  = all.slice(0, 8);
            const times = data.daily.time.slice(0, 8);

            if (chartEl && typeof Chart !== 'undefined') {
                new Chart(chartEl.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: times,
                        datasets: [{
                            data: past,
                            borderColor: '#3b82f6',
                            backgroundColor: 'transparent',
                            tension: 0.4,
                            borderWidth: 2,
                            pointRadius: 0,
                            hitRadius: 20
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        animation: false,
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                        scales: { x: { display: false }, y: { display: false } }
                    }
                });
            }

            if (avgEl) {
                const last3 = all.slice(5, 8);
                avgEl.innerText = `${(last3.reduce((a, b) => a + b, 0) / 3).toFixed(1)}°C`;
            }

            if (fcEl) {
                const dayNames = ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'];
                fcEl.innerHTML = '';
                for (let i = 0; i < 3; i++) {
                    const idx  = 7 + i;
                    const date = new Date(data.daily.time[idx]);
                    const day  = i === 0 ? 'Ma' : dayNames[date.getDay()];
                    const min  = Math.round(data.daily.temperature_2m_min[idx]);
                    const max  = Math.round(data.daily.temperature_2m_max[idx]);
                    const el   = document.createElement('div');
                    el.className = 'fc-item';
                    el.innerHTML = `<span class="fc-day">${day}</span><span class="fc-temp">${min}/${max}°</span>`;
                    fcEl.appendChild(el);
                }
            }
        } catch (e) {}
    },

    injectGlobalNav() {
        const headerInfo = document.querySelector('.header-info');
        if (!headerInfo) return;

        const themeIcon   = this.state.theme === 'dark' ? 'fa-sun' : 'fa-moon';

        headerInfo.innerHTML = `
            <div class="info-wrapper">
                <div class="weather-clock-group">
                    <div id="header-weather" class="hw-block"></div>
                    <div id="global-clock" class="clock-block"></div>
                </div>
                <div class="header-actions">
                    <button class="icon-btn" onclick="App.toggleTheme()"><i class="fas ${themeIcon}"></i></button>
                    <button class="icon-btn" onclick="App.logout()"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            </div>`;
        this.initClock();
    },

    checkLogin() {
        const authId = sessionStorage.getItem('auth_id');
        if (authId === btoa('7575'))      this.state.user = { name: 'Admin', tier: 'admin' };
        else if (authId === btoa('7474')) this.state.user = { name: 'Vendég', tier: 'guest' };
        else                              this.state.user = null;

        if (this.state.user) {
            document.body.classList.add('authenticated');
            this.applyVisibilityFilters();
        } else {
            document.body.classList.remove('authenticated');
        }
    },

    applyVisibilityFilters() {
        if (!this.state.user || this.state.user.tier === 'admin') return;
        document.querySelectorAll('.category-group').forEach(group => {
            const title = group.querySelector('.group-title')?.innerText?.toLowerCase() ?? '';
            if (title.includes('eszközök') || title.includes('információ')) {
                // group.classList.add('disabled-access');
            }
        });
    },

    login() {
        const input = document.getElementById('auth-password-input');
        if (!input) return;
        const pass = input.value;
        if (pass === '7575') {
            sessionStorage.setItem('auth_id', btoa('7575'));
            location.reload();
        } else if (pass === '7474') {
            sessionStorage.setItem('auth_id', btoa('7474'));
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

    initSearch() {
        const input = document.getElementById('dashboard-search');
        if (!input) return;
        const norm = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        input.addEventListener('input', e => {
            const q = norm(e.target.value);
            document.querySelectorAll('.feature-card').forEach(card => {
                const t = norm(card.querySelector('h5')?.innerText ?? '');
                const match = q === '' || t.includes(q);
                card.style.display = match ? 'flex' : 'none';
            });
            document.querySelectorAll('.category-group').forEach(group => {
                const visible = [...group.querySelectorAll('.feature-card')].some(c => c.style.display !== 'none');
                group.style.display = visible ? '' : 'none';
            });
        });
    },

    checkPowerDeadlines() {
        const now  = new Date();
        const year = now.getFullYear();
        const deadlines = [new Date(year, 4, 31), new Date(year, 8, 30)];
        this.state.powerAlert = deadlines.some(d => {
            const diff = Math.ceil((d - now) / 86400000);
            return diff >= 0 && diff <= 14;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

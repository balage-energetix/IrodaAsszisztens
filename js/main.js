/**
 * AGI Modular Web App - Global Core Logic
 */

const App = {
    state: {
        user: null,
        theme: localStorage.getItem('theme') || 'light',
        currentPage: 'home'
    },

    init() {
        this.applyTheme();
        this.initClock();
        this.setupAuth();
        console.log("App initialized");
    },

    // --- Theme Management ---
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        const icon = document.getElementById('theme-toggle-icon');
        if (icon) {
            icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },

    // --- Clock Logic ---
    initClock() {
        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('hu-HU');
            const dateStr = now.toLocaleDateString('hu-HU');
            const clockEl = document.getElementById('global-clock');
            if (clockEl) clockEl.innerText = `${dateStr} ${timeStr}`;
        };
        setInterval(update, 1000);
        update();
    },

    // --- Google Auth Skeleton ---
    setupAuth() {
        // Placeholder for Google Identity Services initialization
        window.onload = () => {
            if (typeof google !== 'undefined') {
                google.accounts.id.initialize({
                    client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // To be replaced by user
                    callback: this.handleAuthResponse.bind(this)
                });
                google.accounts.id.renderButton(
                    document.getElementById("google-sigin-btn"),
                    { theme: "outline", size: "large" }
                );
            }
        };
    },

    handleAuthResponse(response) {
        console.log("Google Auth Response:", response);
        // Decode JWT and set user state
        // this.state.user = ...
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('app-main').style.display = 'block';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => App.init());

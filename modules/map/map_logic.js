/**
 * MapLogic - Common Leaflet utilities for Irodai Asszisztens
 */
const MapLogic = {
    map: null,
    drawnItems: null,
    contextMenu: null,
    lastLatlng: null,

    init(containerId, center = [46.229, 17.365], zoom = 15) {
        this.map = L.map(containerId).setView(center, zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            crossOrigin: true,
            attribution: '&copy; OpenStreetMap'
        }).addTo(this.map);

        // Street Search
        if (L.Control.geocoder) {
            L.Control.geocoder({ defaultMarkGeocode: true, placeholder: "Keresés..." }).addTo(this.map);
        }

        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        this._setupContextMenu();
        this._setupDrawing();

        return this.map;
    },

    _setupContextMenu() {
        this.contextMenu = document.getElementById('map-context-menu');
        if (!this.contextMenu) return;

        this.map.on('contextmenu', (e) => {
            e.originalEvent.preventDefault();
            this.lastLatlng = e.latlng;
            this.contextMenu.style.display = 'block';
            this.contextMenu.style.left = e.originalEvent.clientX + 'px';
            this.contextMenu.style.top = e.originalEvent.clientY + 'px';
        });

        document.addEventListener('click', () => {
            if (this.contextMenu) this.contextMenu.style.display = 'none';
        });
    },

    _setupDrawing() {
        if (!L.Control.Draw) return;

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: this.drawnItems },
            draw: {
                polyline: { shapeOptions: { color: '#ef233c', weight: 4 } },
                polygon: false, circle: false, rectangle: false, marker: false, circlemarker: false
            }
        });
        this.map.addControl(drawControl);

        this.map.on(L.Draw.Event.CREATED, (e) => {
            this.drawnItems.addLayer(e.layer);
        });
    },

    addPointer(icon, color, text = "") {
        if (!this.lastLatlng) return;

        const customIcon = L.divIcon({
            html: `<i class="fas ${icon}" style="color:${color}; font-size:2rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));"></i>`,
            className: '', iconSize: [30, 30], iconAnchor: [15, 30]
        });

        const marker = L.marker(this.lastLatlng, { icon: customIcon, draggable: true }).addTo(this.drawnItems);

        if (text) {
            marker.bindPopup(`<strong>Bejelentés:</strong><br>${text}`).openPopup();
        }

        marker.on('contextmenu', (e) => {
            L.DomEvent.stopPropagation(e);
            this.drawnItems.removeLayer(marker);
        });

        return marker;
    },

    async exportPDF(containerId, title) {
        if (typeof html2pdf === 'undefined') {
            console.error("html2pdf is not loaded");
            return;
        }

        const mapContainer = document.getElementById(containerId);
        const originalParent = mapContainer.parentNode;
        const nextSib = mapContainer.nextSibling;

        const exportWrapper = document.createElement('div');
        exportWrapper.style.padding = '20px';
        exportWrapper.style.backgroundColor = '#ffffff';
        exportWrapper.style.width = '1450px';

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 6px solid #000000; padding-bottom: 15px; margin-bottom: 20px;
            font-family: 'Outfit', sans-serif; color: #000000;
        `;
        header.innerHTML = `
            <div style="font-weight: 800; font-size: 28px;">${title}</div>
            <div style="font-size: 16px; font-weight: 700;">Dátum: ${new Date().toLocaleString('hu-HU')}</div>
        `;

        exportWrapper.appendChild(header);
        const originalStyle = mapContainer.getAttribute('style') || '';

        // Move map to wrapper
        exportWrapper.appendChild(mapContainer);
        document.body.appendChild(exportWrapper);

        mapContainer.style.width = '1390px';
        mapContainer.style.height = '800px';
        this.map.invalidateSize();

        const opt = {
            margin: 5,
            filename: `Export_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 1.5, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        try {
            await html2pdf().set(opt).from(exportWrapper).save();
        } finally {
            // Restore map
            if (nextSib) {
                originalParent.insertBefore(mapContainer, nextSib);
            } else {
                originalParent.appendChild(mapContainer);
            }
            mapContainer.setAttribute('style', originalStyle);
            exportWrapper.remove();
            this.map.invalidateSize();
        }
    }
};

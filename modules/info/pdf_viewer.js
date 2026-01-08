/**
 * PDF Viewer Module for Irodai Asszisztens
 * Supports high-fidelity PDF.js rendering, native fallback,
 * and a canvas-based drawing/annotation layer.
 */

const PDFViewer = {
    pdfjsLib: null,
    drawState: {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        color: '#ff0000',
        width: 3,
        mode: 'pan' // 'pan' or 'draw'
    },

    init() {
        this.pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];
        if (this.pdfjsLib) {
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    },

    setInteractionMode(mode) {
        this.drawState.mode = mode;
        const layers = document.querySelectorAll('#annotation-layer');
        layers.forEach(canvas => {
            canvas.style.cursor = mode === 'draw' ? 'crosshair' : 'grab';
            // If in pan mode, we might want to disable pointer events on the canvas
            // to allow interaction with the iframe, BUT we want panning to work on the canvas too.
            // If we use our own panning logic on the canvas, it's fine.
        });
    },

    async renderHTML(containerId, url, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.background = 'transparent'; // Fix whiteness
        container.innerHTML = `<div class="pdf-loading" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:100; color:#333;"><i class="fas fa-spinner fa-spin"></i> Betöltés...</div>`;

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        iframe.style.background = 'transparent';
        iframe.id = `iframe-${containerId}`;
        container.appendChild(iframe);

        let isInitialized = false;
        let checkInterval = null;
        let timeoutId = null;

        const finalizeInitialization = () => {
            if (isInitialized) return;
            isInitialized = true;

            if (checkInterval) clearInterval(checkInterval);
            if (timeoutId) clearTimeout(timeoutId);

            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const pageContainer = doc.getElementById('page-container');
                const sidebar = doc.getElementById('sidebar');

                if (sidebar) sidebar.style.display = 'none';
                if (!pageContainer) {
                    console.warn("Page container not found in HTML map yet, forcing visibility.");
                    // If it was forced by timeout but no page container, we show it anyway
                    iframe.style.visibility = 'visible';
                    const loading = container.querySelector('.pdf-loading');
                    if (loading) loading.remove();
                    return;
                }

                // Clean up any existing annotation from the source HTML if it was saved there
                const oldCanvas = doc.getElementById('annotation-layer');
                if (oldCanvas) oldCanvas.remove();

                // Setup styles for stability
                doc.body.style.margin = '0';
                doc.body.style.background = 'transparent';
                doc.documentElement.style.background = 'transparent';

                // Initial setup for rotation/scale
                pageContainer.dataset.rotation = options.rotate || 0;
                pageContainer.dataset.scale = options.scale || 1.0;

                // Apply initial scale/transform
                const scale = options.scale || 1.0;
                pageContainer.style.transformOrigin = 'top left';
                pageContainer.style.transform = `scale(${scale})`;

                // Ensure text layer and other elements are visible
                const textLayer = doc.querySelector('.textLayer');
                if (textLayer) textLayer.style.opacity = '1';

                // Make visible
                iframe.style.visibility = 'visible';
                const loading = container.querySelector('.pdf-loading');
                if (loading) loading.remove();

                // Centering after a layout task
                setTimeout(() => {
                    this._centerContent(iframe, container);
                    this.initDrawing(drawCanvas, doc.documentElement, true);
                    if (options.onRender) options.onRender(drawCanvas);
                }, 300);

            } catch (e) {
                console.error("Map initialization error:", e);
            }
        };
    },

    _applyTransforms(element) {
        const rotation = element.dataset.rotation || 0;
        const scale = element.dataset.scale || 1.0;
        element.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        element.style.transformOrigin = 'center center';

        // If rotated 90 or 270, the "width" and "height" effectively swap
        // but for scrolling we need the container to represent this.
        element.style.transition = 'transform 0.2s ease-out';
    },

    _centerContent(iframe, container) {
        const win = iframe.contentWindow;
        const doc = win.document;
        const pageContainer = doc.getElementById('page-container');
        if (!pageContainer) return;

        // We target the center of the bounding box relative to the viewport
        const rect = pageContainer.getBoundingClientRect();
        const scrollX = (rect.width / 2) - (container.offsetWidth / 2);
        const scrollY = (rect.height / 2) - (container.offsetHeight / 2);

        win.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: 'auto'
        });
    },

    setHTMLZoom(containerId, scale) {
        const container = document.getElementById(containerId);
        const iframe = container.querySelector('iframe');
        if (!iframe) return;

        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const pageContainer = doc.getElementById('page-container');
            if (pageContainer) {
                pageContainer.dataset.scale = scale;
                this._applyTransforms(pageContainer);
            }
        } catch (e) {
            console.warn("Zoom failed:", e);
        }
    },

    // Standard PDF.js render remains as fallback or for direct PDFs
    async render(containerId, url, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `<div class="pdf-loading"><i class="fas fa-spinner fa-spin"></i> PDF betöltése...</div>`;

        try {
            const loadingTask = this.pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const scale = options.scale || 1.5;
            const rotation = options.rotate || 0;
            const viewport = page.getViewport({ scale, rotation });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.appendChild(canvas);

            const drawCanvas = document.createElement('canvas');
            drawCanvas.id = 'annotation-layer';
            drawCanvas.width = viewport.width;
            drawCanvas.height = viewport.height;
            drawCanvas.style.position = 'absolute';
            drawCanvas.style.top = '0';
            drawCanvas.style.left = '0';
            wrapper.appendChild(drawCanvas);

            container.innerHTML = '';
            container.appendChild(wrapper);

            await page.render({ canvasContext: context, viewport }).promise;
            this.initDrawing(drawCanvas, container);
        } catch (e) {
            console.error("PDF render failed:", e);
            container.innerHTML = '<div class="alert alert-danger">Sikertelen betöltés.</div>';
        }
    },

    renderNative(container, url, options) {
        const rotation = options.rotate || 0;
        container.innerHTML = '';
        container.style.overflow = 'hidden';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';

        const embedWrapper = document.createElement('div');
        embedWrapper.style.position = 'relative';
        embedWrapper.style.width = '100%';
        embedWrapper.style.height = '100%';

        const embed = document.createElement('embed');
        embed.src = `${url}#toolbar=0&navpanes=0&view=FitH`;
        embed.type = 'application/pdf';

        if (rotation % 180 !== 0) {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            embed.style.width = h + 'px';
            embed.style.height = w + 'px';
            embed.style.transform = `rotate(${rotation}deg)`;
            embed.style.transformOrigin = 'center';
        } else {
            embed.style.width = '100%';
            embed.style.height = '100%';
            if (rotation === 180) embed.style.transform = 'rotate(180deg)';
        }

        embedWrapper.appendChild(embed);

        const drawLayer = document.createElement('canvas');
        drawLayer.id = 'annotation-layer';
        drawLayer.style.position = 'absolute';
        drawLayer.style.top = '0';
        drawLayer.style.left = '0';
        drawLayer.style.width = '100%';
        drawLayer.style.height = '100%';
        drawLayer.style.pointerEvents = 'auto';
        drawLayer.style.cursor = this.drawState.mode === 'draw' ? 'crosshair' : 'grab';
        embedWrapper.appendChild(drawLayer);

        container.appendChild(embedWrapper);

        setTimeout(() => {
            drawLayer.width = drawLayer.offsetWidth;
            drawLayer.height = drawLayer.offsetHeight;
            this.initDrawing(drawLayer, container);
        }, 500);
    },

    initDrawing(canvas, targetElement, isIframe = false) {
        const ctx = canvas.getContext('2d');
        let isPanning = false;
        let startX, startY, scrollLeft, scrollTop;

        const start = (e) => {
            const evt = e.touches ? e.touches[0] : e;
            if (this.drawState.mode === 'draw') {
                this.drawState.isDrawing = true;
                const [x, y] = this.getCoords(e, canvas);
                this.drawState.lastX = x;
                this.drawState.lastY = y;
            } else {
                isPanning = true;
                canvas.style.cursor = 'grabbing';
                startX = evt.clientX;
                startY = evt.clientY;
                const win = isIframe ? canvas.ownerDocument.defaultView : window;
                scrollLeft = isIframe ? win.scrollX : targetElement.scrollLeft;
                scrollTop = isIframe ? win.scrollY : targetElement.scrollTop;
            }
        };

        const move = (e) => {
            const evt = e.touches ? e.touches[0] : e;
            if (this.drawState.isDrawing) {
                const [x, y] = this.getCoords(evt, canvas);
                ctx.beginPath();
                ctx.moveTo(this.drawState.lastX, this.drawState.lastY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = this.drawState.color;
                ctx.lineWidth = this.drawState.width;
                ctx.lineCap = 'round';
                ctx.stroke();
                this.drawState.lastX = x;
                this.drawState.lastY = y;
            } else if (isPanning) {
                const dx = evt.clientX - startX;
                const dy = evt.clientY - startY;
                const win = isIframe ? canvas.ownerDocument.defaultView : window;
                if (isIframe) {
                    win.scrollTo(scrollLeft - dx, scrollTop - dy);
                } else {
                    targetElement.scrollLeft = scrollLeft - dx;
                    targetElement.scrollTop = scrollTop - dy;
                }
            }
        };

        const stop = () => {
            this.drawState.isDrawing = false;
            isPanning = false;
            canvas.style.cursor = this.drawState.mode === 'draw' ? 'crosshair' : 'grab';
        };

        canvas.addEventListener('mousedown', start);
        canvas.ownerDocument.addEventListener('mousemove', move);
        canvas.ownerDocument.addEventListener('mouseup', stop);

        // Touch support
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
        canvas.ownerDocument.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, { passive: false });
        canvas.ownerDocument.addEventListener('touchend', stop);
    },

    getCoords(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const pageContainer = canvas.parentElement;
        const scale = parseFloat(pageContainer.dataset.scale || 1);
        const rotation = parseInt(pageContainer.dataset.rotation || 0);

        // Get relative mouse position within the transformed canvas rect
        let rx = (e.clientX - rect.left) / scale;
        let ry = (e.clientY - rect.top) / scale;

        // Correct for rotation if necessary
        // Since the canvas is A CHILD of the rotated element, 
        // Mouse coordinates are already in the rotated frame of the parent rect.
        // But we might need to adjust for the origin swap if we used transform-origin: center.
        // Actually, getBoundingClientRect for children of transformed elements is already in screen space.
        // If we want the local coordinate on the canvas (0-width, 0-height):

        return [rx, ry];
    },

    setDrawBrush(color, width) {
        if (color) this.drawState.color = color;
        if (width) this.drawState.width = width;
        this.setInteractionMode('draw');
    },

    clearAnnotations(containerId) {
        const findCanvas = (root) => {
            const iframe = root.querySelector('iframe');
            if (iframe) {
                return iframe.contentDocument.getElementById('annotation-layer');
            }
            return root.querySelector('#annotation-layer');
        };

        const root = containerId ? document.getElementById(containerId) : document;
        const canvas = findCanvas(root);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    capture(canvasId, filename) {
        const container = document.getElementById(canvasId);
        if (!container) return;

        const iframe = container.querySelector('iframe');
        if (!iframe) {
            // Fallback for non-iframe viewers
            const c = container.querySelector('canvas');
            if (c) {
                const link = document.createElement('a');
                link.download = filename + '.png';
                link.href = c.toDataURL();
                link.click();
            }
            return;
        }

        try {
            // The user requested to use browser print or a real capture.
            // Since we can't easily capture rotated iframe content to canvas via JS,
            // we suggest the user prints or we can try a basic screenshot if they have a tool.
            // But I will implement a simplified "save current view" if possible.
            alert('A nagy felbontású térképkivágáshoz használja a böngésző nyomtatását (Ctrl+P) vagy egy külső képernyőmentő eszközt.');
        } catch (e) { }
    }
};

window.PDFViewer = PDFViewer;
PDFViewer.init();

// PDF Watermark Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-watermark'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFile = null;
        let pdfDoc = null;

        // Ensure PDF.js worker is set
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files[0].type === 'application/pdf') {
                pdfFile = files[0];
                await initEditor();
            } else {
                alert('Please upload a PDF file.');
            }
        }, 'application/pdf');

        async function initEditor() {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            renderUI();

            // Initial Preview Render
            await updatePreview();

            // Attach listeners for live preview
            const inputs = ['watermarkText', 'fontSize', 'opacity', 'watermarkColor', 'rotation', 'watermarkPosition'];
            inputs.forEach(id => {
                document.getElementById(id).addEventListener('input', updatePreview);
            });
        }

        function renderUI() {
            editorArea.innerHTML = `
                <div class="tool-container" style="max-width: 900px; margin: 0 auto; padding: 2rem; display: flex; gap: 2rem; flex-wrap: wrap;">
                    
                    <!-- Preview Section -->
                    <div style="flex: 1; min-width: 300px; background: #e5e7eb; padding: 1rem; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <canvas id="previewCanvas" style="max-width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #ccc;"></canvas>
                    </div>

                    <!-- Controls Section -->
                    <div style="flex: 1; min-width: 300px;">
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <h2 style="font-size: 1.25rem;">${pdfFile.name}</h2>
                            <p style="color: var(--text-muted);">Previewing Page 1</p>
                        </div>

                        <div class="control-group">
                            <label class="control-label">Watermark Text</label>
                            <input type="text" id="watermarkText" placeholder="Enter watermark text" value="CONFIDENTIAL">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="control-group">
                                <label class="control-label">Font Size</label>
                                <input type="number" id="fontSize" value="30" min="10" max="200">
                            </div>
                            <div class="control-group">
                                <label class="control-label">Opacity</label>
                                <input type="number" id="opacity" value="0.3" min="0" max="1" step="0.1">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="control-group">
                                <label class="control-label">Color</label>
                                <input type="color" id="watermarkColor" value="#808080" style="width: 100%; height: 40px; padding: 2px;">
                            </div>
                            <div class="control-group">
                                <label class="control-label">Rotation (°)</label>
                                <input type="number" id="rotation" value="45" min="-360" max="360">
                            </div>
                        </div>

                        <div class="control-group">
                            <label class="control-label">Position</label>
                            <select id="watermarkPosition" class="control-input">
                                <option value="center" selected>Center</option>
                                <option value="top-left">Top Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-right">Bottom Right</option>
                            </select>
                        </div>

                        <div style="margin-top: 2rem; text-align: center;">
                            <button class="btn" style="width: 100%; margin-bottom: 0.5rem;" onclick="document.querySelector('[data-tool=pdf-watermark]').applyWatermark()">
                                <i class="fa-solid fa-download"></i> Download PDF
                            </button>
                            <button class="btn btn-secondary" style="width: 100%;" onclick="location.reload()">Start Over</button>
                        </div>
                    </div>
                </div>
            `;
        }

        let pdfPageViewport = null;
        let originalPageDims = null;

        async function updatePreview() {
            const canvas = document.getElementById('previewCanvas');
            const ctx = canvas.getContext('2d');

            // 1. Render PDF Page to Canvas (if not already cached/setup)
            if (!pdfPageViewport) {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);

                // Scale viewport to fit reasonably in the canvas area (e.g. max width 500px)
                const desiredWidth = 500;
                let viewport = page.getViewport({ scale: 1.0 });
                const scale = desiredWidth / viewport.width;
                viewport = page.getViewport({ scale: scale });

                pdfPageViewport = viewport;
                originalPageDims = page.getViewport({ scale: 1.0 }); // Keep original dims for saving logic

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF to canvas
                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
            } else {
                // Redraw PDF (clear previous watermark) - we need to re-render the page background
                // For performance, we could cache the "clean" page image, but re-rendering is fast enough for single page
                // Simpler: Just re-render everything
                const arrayBuffer = await pdfFile.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                await page.render({
                    canvasContext: ctx,
                    viewport: pdfPageViewport
                }).promise;
            }

            // 2. Draw Watermark Overlay
            const text = document.getElementById('watermarkText').value;
            if (!text) return;

            const fontSizeOriginal = parseInt(document.getElementById('fontSize').value);
            const opacity = parseFloat(document.getElementById('opacity').value);
            const colorHex = document.getElementById('watermarkColor').value;
            const rotation = parseInt(document.getElementById('rotation').value);
            const position = document.getElementById('watermarkPosition').value;

            // Scale font size to match the preview scale
            const scaleFactor = pdfPageViewport.width / originalPageDims.width;
            const scaledFontSize = fontSizeOriginal * scaleFactor;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = colorHex;
            ctx.font = `${scaledFontSize}px Helvetica, sans-serif`;

            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            // Best guess for height is rough, canvas doesn't give precise height easily
            const textHeight = scaledFontSize;

            let x, y;
            const margin = 50 * scaleFactor;

            switch (position) {
                case 'top-left':
                    x = margin;
                    y = margin + textHeight; // Canvas coords start top-left
                    break;
                case 'top-right':
                    x = canvas.width - textWidth - margin;
                    y = margin + textHeight;
                    break;
                case 'bottom-left':
                    x = margin;
                    y = canvas.height - margin;
                    break;
                case 'bottom-right':
                    x = canvas.width - textWidth - margin;
                    y = canvas.height - margin;
                    break;
                default: // Center
                    x = (canvas.width - textWidth) / 2;
                    y = (canvas.height + textHeight) / 2;
            }

            // Handle Rotation around the center of the text
            ctx.translate(x + textWidth / 2, y - textHeight / 3); // Translate to center of text
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.fillText(text, -textWidth / 2, textHeight / 3); // Draw centered at origin

            ctx.restore();
        }


        document.querySelector('[data-tool="pdf-watermark"]').applyWatermark = async function () {
            try {
                const text = document.getElementById('watermarkText').value;
                const fontSize = parseInt(document.getElementById('fontSize').value);
                const opacity = parseFloat(document.getElementById('opacity').value);
                const colorHex = document.getElementById('watermarkColor').value;
                const rotation = parseInt(document.getElementById('rotation').value);
                const position = document.getElementById('watermarkPosition').value;

                if (!text) return alert('Enter watermark text');

                // Helper to convert hex to RGB
                const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16) / 255,
                        g: parseInt(result[2], 16) / 255,
                        b: parseInt(result[3], 16) / 255
                    } : { r: 0.5, g: 0.5, b: 0.5 };
                };
                const rgbColor = hexToRgb(colorHex);

                const arrayBuffer = await pdfFile.arrayBuffer();
                const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const pages = pdfDoc.getPages();

                pages.forEach(page => {
                    const { width, height } = page.getSize();
                    const textWidth = font.widthOfTextAtSize(text, fontSize);
                    const textHeight = font.heightAtSize(fontSize);

                    let x, y;
                    const margin = 50;

                    // PDF Coordinates: (0,0) is BOTTOM-LEFT
                    switch (position) {
                        case 'top-left': x = margin; y = height - margin - textHeight; break;
                        case 'top-right': x = width - margin - textWidth; y = height - margin - textHeight; break;
                        case 'bottom-left': x = margin; y = margin; break;
                        case 'bottom-right': x = width - margin - textWidth; y = margin; break;
                        default: // Center
                            x = (width - textWidth) / 2;
                            y = (height - textHeight) / 2;
                    }

                    page.drawText(text, {
                        x: x,
                        y: y,
                        size: fontSize,
                        font: font,
                        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                        opacity: opacity,
                        rotate: degrees(rotation)
                    });
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, `watermarked_${pdfFile.name}`);

            } catch (error) {
                console.error('Error applying watermark:', error);
                alert('Error applying watermark.');
            }
        };
    }
};

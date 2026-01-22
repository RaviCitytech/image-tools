// PDF Sign Tool - Add signatures to PDF
if (!window.Tools) window.Tools = {};

window.Tools['pdf-sign'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFile = null;
        let pdfDoc = null;
        let totalPages = 0;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files[0].type === 'application/pdf') {
                pdfFile = files[0];
                await loadPDF();
            } else {
                alert('Please upload a PDF file.');
            }
        }, 'application/pdf');

        async function loadPDF() {
            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const { PDFDocument } = PDFLib;
                pdfDoc = await PDFDocument.load(arrayBuffer);
                totalPages = pdfDoc.getPageCount();
                showEditor();
            } catch (error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF.');
            }
        }

        function showEditor() {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            editorArea.innerHTML = '';

            const layout = document.createElement('div');
            layout.className = 'editor-layout';

            const previewArea = document.createElement('div');
            previewArea.className = 'preview-area';
            previewArea.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">${pdfFile.name}</h3>
                    <p style="color: var(--text-muted);">${totalPages} Pages</p>
                    
                    <div style="background: white; border: 2px dashed var(--border); border-radius: 8px; display: inline-block; margin-top: 1rem; position: relative;">
                        <canvas id="signatureCanvas" width="500" height="200" style="touch-action: none; cursor: crosshair;"></canvas>
                        <div style="position: absolute; bottom: 5px; right: 5px; color: #999; font-size: 0.8rem; pointer-events: none;">Draw Signature Here</div>
                    </div>
                    <br>
                    <button class="btn btn-secondary" onclick="document.querySelector('[data-tool=pdf-sign]').clearSignature()" style="margin-top: 0.5rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-eraser"></i> Clear Signature
                    </button>
                </div>
            `;

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            sidebar.innerHTML = `
                <div class="control-group">
                    <label class="control-label">Page Number (1-${totalPages})</label>
                    <input type="number" id="pageNumber" value="${totalPages}" min="1" max="${totalPages}">
                </div>
                
                <div class="control-group">
                    <label class="control-label">Position</label>
                    <select id="sigPosition">
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                    </select>
                </div>
                 
                <div class="control-group">
                    <label class="control-label">Scale (Size)</label>
                    <input type="range" id="sigScale" min="0.1" max="1.0" step="0.1" value="0.3" 
                        oninput="document.getElementById('scaleVal').innerText = this.value">
                    <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted);"><span id="scaleVal">0.3</span>x</div>
                </div>

                <button class="btn" style="width: 100%; margin-top: 2rem;" onclick="document.querySelector('[data-tool=pdf-sign]').signPDF()">
                    <i class="fa-solid fa-file-signature"></i> Sign PDF
                </button>
                <button class="btn btn-secondary" onclick="location.reload()" style="width: 100%; margin-top: 0.5rem;">Start Over</button>
            `;

            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);

            initCanvas();
        }

        let canvas, ctx, isDrawing = false;

        function initCanvas() {
            canvas = document.getElementById('signatureCanvas');
            ctx = canvas.getContext('2d');
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';

            const startDraw = (e) => {
                isDrawing = true;
                ctx.beginPath();
                const { offsetX, offsetY } = getCoordinates(e);
                ctx.moveTo(offsetX, offsetY);
            };

            const draw = (e) => {
                if (!isDrawing) return;
                const { offsetX, offsetY } = getCoordinates(e);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            };

            const endDraw = () => {
                isDrawing = false;
            };

            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseout', endDraw);

            // Touch support
            canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e.touches[0]); });
            canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); });
            canvas.addEventListener('touchend', (e) => { e.preventDefault(); endDraw(); });
        }

        function getCoordinates(e) {
            if (e.touches) {
                const rect = canvas.getBoundingClientRect();
                return {
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top
                };
            }
            return { offsetX: e.offsetX, offsetY: e.offsetY };
        }

        document.querySelector('[data-tool="pdf-sign"]').clearSignature = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        document.querySelector('[data-tool="pdf-sign"]').signPDF = async function () {
            try {
                const pageNum = parseInt(document.getElementById('pageNumber').value);
                const position = document.getElementById('sigPosition').value;
                const scale = parseFloat(document.getElementById('sigScale').value);

                // Convert canvas to PNG
                const pngImageBytes = await new Promise(resolve => canvas.toBlob(blob => blob.arrayBuffer(), 'image/png'));

                // Embed in PDF
                const pngImage = await pdfDoc.embedPng(pngImageBytes);
                const page = pdfDoc.getPage(pageNum - 1);
                const { width, height } = page.getSize();

                // Scale image
                const imgDims = pngImage.scale(scale);

                let x, y;
                const margin = 50;

                switch (position) {
                    case 'bottom-right':
                        x = width - imgDims.width - margin;
                        y = margin;
                        break;
                    case 'bottom-left':
                        x = margin;
                        y = margin;
                        break;
                    default: // Center
                        x = (width - imgDims.width) / 2;
                        y = margin;
                }

                page.drawImage(pngImage, {
                    x: x,
                    y: y,
                    width: imgDims.width,
                    height: imgDims.height,
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, `signed_${pdfFile.name}`);

            } catch (e) {
                console.error(e);
                alert("Error signing PDF");
            }
        };
    }
};

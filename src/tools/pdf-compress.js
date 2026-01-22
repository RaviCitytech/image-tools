// PDF Compress Tool - Basic implementation
if (!window.Tools) window.Tools = {};

window.Tools['pdf-compress'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFile = null;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files[0].type === 'application/pdf') {
                pdfFile = files[0];
                showEditor();
            } else {
                alert('Please upload a PDF file.');
            }
        }, 'application/pdf');

        function showEditor() {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            editorArea.innerHTML = `
                <div class="tool-container" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-file-zipper" style="font-size: 4rem; color: #ef4444; margin-bottom: 1.5rem;"></i>
                    <h2>${pdfFile.name}</h2>
                    <p style="color: var(--text-muted); margin: 1rem 0;">Size: ${(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <div class="control-group" style="max-width: 400px; margin: 0 auto;">
                        <label class="control-label">Compression Level (Image Quality): <span id="qualityVal">70</span>%</label>
                        <input type="range" id="compressionQuality" min="10" max="100" value="70" 
                            oninput="document.getElementById('qualityVal').innerText = this.value">
                        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
                            Lower percentage = Smaller file size (Lower image quality)
                        </p>
                    </div>
                    <button class="btn" onclick="document.querySelector('[data-tool=pdf-compress]').compressPDF()" style="margin: 0.5rem;">
                        <i class="fa-solid fa-compress"></i> Compress PDF
                    </button>
                    <button class="btn btn-secondary" onclick="location.reload()">Start Over</button>
                    <p style="color: var(--text-muted); margin-top: 2rem; font-size: 0.85rem;">
                        Note: This method rasterizes PDF pages to images to achieve maximum compression. Text will no longer be selectable.
                    </p>
                </div>
            `;
        }

        document.querySelector('[data-tool="pdf-compress"]').compressPDF = async function () {
            try {
                uploadArea.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-3x"></i><p style="margin-top: 1rem;">Compressing PDF (this may take a moment)...</p></div>';

                const quality = parseInt(document.getElementById('compressionQuality').value) / 100;
                const arrayBuffer = await pdfFile.arrayBuffer();

                // 1. Initialize PDF.js
                if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js library not loaded');
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const srcPdf = await loadingTask.promise;

                // 2. Create new PDF
                const { PDFDocument } = PDFLib;
                const newPdf = await PDFDocument.create();

                const totalPages = srcPdf.numPages;

                // 3. Process each page
                for (let i = 1; i <= totalPages; i++) {
                    // Update progress
                    uploadArea.innerHTML = `<div style="text-align: center; padding: 3rem;">
                        <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
                        <p style="margin-top: 1rem;">Processing page ${i} of ${totalPages}...</p>
                    </div>`;

                    const page = await srcPdf.getPage(i);
                    // Scale depends on quality slightly to reduce dims if very low quality
                    // Standard viewport 1.5 is good balance for reading
                    const scale = quality < 0.5 ? 1.0 : 1.5;
                    const viewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    // Compress to JPEG
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
                    const arrayBuffer = await blob.arrayBuffer();
                    const embeddedImage = await newPdf.embedJpg(arrayBuffer);

                    const newPage = newPdf.addPage([viewport.width, viewport.height]);
                    newPage.drawImage(embeddedImage, {
                        x: 0,
                        y: 0,
                        width: viewport.width,
                        height: viewport.height
                    });
                }

                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                const originalSizeMB = (pdfFile.size / 1024 / 1024).toFixed(2);
                const newSizeMB = (blob.size / 1024 / 1024).toFixed(2);
                const reduction = ((1 - blob.size / pdfFile.size) * 100).toFixed(1);

                window.AppUtils.downloadBlob(blob, `compressed_${pdfFile.name}`);

                uploadArea.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fa-solid fa-check-circle" style="color: #22c55e; font-size: 3rem;"></i>
                        <h3 style="margin: 1rem 0;">Compression Complete!</h3>
                        <p>Original: ${originalSizeMB} MB <i class="fa-solid fa-arrow-right"></i> New: ${newSizeMB} MB</p>
                        <p style="color: #22c55e; font-weight: bold;">Reduced by ${reduction}%</p>
                        <button class="btn" onclick="location.reload()" style="margin-top: 1rem;">Compress Another</button>
                    </div>
                `;

            } catch (error) {
                console.error('Error compressing PDF:', error);
                alert('Error compressing PDF: ' + error.message);
                location.reload();
            }
        };
    }
};

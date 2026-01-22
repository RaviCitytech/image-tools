// PDF Convert Tool - PDF to Images and Images to PDF
if (!window.Tools) window.Tools = {};

window.Tools['pdf-convert'] = {
    init(uploadArea, editorArea, appState) {
        showModeSelection();

        function showModeSelection() {
            uploadArea.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h2 style="margin-bottom: 2rem;">Choose Conversion Type</h2>
                    <button class="btn" onclick="document.querySelector('[data-tool=pdf-convert]').selectMode('pdf-to-image')" style="margin: 0.5rem; width: 250px;">
                        <i class="fa-solid fa-file-pdf"></i> PDF to Images
                    </button>
                    <br>
                    <button class="btn" onclick="document.querySelector('[data-tool=pdf-convert]').selectMode('image-to-pdf')" style="margin: 0.5rem; width: 250px;">
                        <i class="fa-solid fa-image"></i> Images to PDF
                    </button>
                </div>
            `;
        }

        document.querySelector('[data-tool="pdf-convert"]').selectMode = function (mode) {
            if (mode === 'pdf-to-image') {
                setupPDFToImage();
            } else {
                setupImageToPDF();
            }
        };

        function setupPDFToImage() {
            uploadArea.innerHTML = `
                <div class="drop-zone" id="pdfDropZone">
                    <i class="fa-solid fa-file-pdf"></i>
                    <p>Drop PDF file here or click to upload</p>
                    <input type="file" id="pdfInput" accept="application/pdf" style="display: none;">
                </div>
            `;

            const dropZone = document.getElementById('pdfDropZone');
            const input = document.getElementById('pdfInput');

            dropZone.onclick = () => input.click();
            input.onchange = (e) => convertPDFToImages(e.target.files[0]);
        }

        function setupImageToPDF() {
            window.AppUtils.setupUpload(uploadArea, async (files) => {
                await convertImagesToPDF(Array.from(files));
            }, 'image/*');
        }

        async function convertPDFToImages(pdfFile) {
            try {
                uploadArea.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-spinner fa-spin fa-3x"></i><p style="margin-top: 1rem;">Converting PDF to images...</p></div>';

                const arrayBuffer = await pdfFile.arrayBuffer();

                // Initialize PDF.js
                // Ensure pdfjsLib is available
                if (typeof pdfjsLib === 'undefined') {
                    throw new Error('PDF.js library not loaded');
                }

                // Set worker source explicitly to match the library version
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                const images = [];
                const totalPages = pdf.numPages;

                for (let i = 1; i <= totalPages; i++) {
                    // Update progress
                    uploadArea.innerHTML = `<div style="text-align: center; padding: 3rem;">
                        <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
                        <p style="margin-top: 1rem;">Processing page ${i} of ${totalPages}...</p>
                    </div>`;

                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    images.push({
                        name: `${pdfFile.name.replace('.pdf', '')}_page_${i}.png`,
                        blob: blob
                    });
                }

                if (images.length === 0) {
                    throw new Error('No pages found in PDF');
                }

                if (images.length === 1) {
                    window.AppUtils.downloadBlob(images[0].blob, images[0].name);
                } else {
                    await window.AppUtils.downloadZip(images, `${pdfFile.name}_images.zip`);
                }

                uploadArea.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fa-solid fa-check-circle" style="color: #22c55e; font-size: 3rem;"></i>
                        <h3 style="margin: 1rem 0;">Conversion Complete!</h3>
                        <p>${images.length} images extracted.</p>
                        <button class="btn" onclick="location.reload()" style="margin-top: 1rem;">Convert Another</button>
                    </div>
                `;

            } catch (error) {
                console.error('Error converting PDF:', error);
                alert('Error converting PDF to images: ' + error.message);
                location.reload();
            }
        }

        async function convertImagesToPDF(imageFiles) {
            try {
                const { PDFDocument } = PDFLib;
                const pdfDoc = await PDFDocument.create();

                for (const file of imageFiles) {
                    const arrayBuffer = await file.arrayBuffer();
                    let image;

                    if (file.type === 'image/png') {
                        image = await pdfDoc.embedPng(arrayBuffer);
                    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                        image = await pdfDoc.embedJpg(arrayBuffer);
                    } else {
                        continue; // Skip unsupported formats
                    }

                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height
                    });
                }

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, 'converted.pdf');
            } catch (error) {
                console.error('Error converting images to PDF:', error);
                alert('Error converting images to PDF.');
            }
        }
    }
};

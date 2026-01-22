// PDF Create Tool - Create PDF from scratch or from files
if (!window.Tools) window.Tools = {};

window.Tools['pdf-create'] = {
    init(uploadArea, editorArea, appState) {
        showModeSelection();

        function showModeSelection() {
            uploadArea.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h2 style="margin-bottom: 2rem;">Create PDF</h2>
                    <button class="btn" onclick="document.querySelector('[data-tool=pdf-create]').createBlankPDF()" style="margin: 0.5rem; width: 250px;">
                        <i class="fa-solid fa-file-circle-plus"></i> Create Blank PDF
                    </button>
                    <br>
                    <button class="btn" onclick="document.querySelector('[data-tool=pdf-create]').createFromImages()" style="margin: 0.5rem; width: 250px;">
                        <i class="fa-solid fa-images"></i> Create from Images
                    </button>
                </div>
            `;
        }

        document.querySelector('[data-tool="pdf-create"]').createBlankPDF = async function () {
            try {
                const { PDFDocument, rgb } = PDFLib;
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([595, 842]); // A4 size

                const { width, height } = page.getSize();
                page.drawText('Blank PDF Document', {
                    x: 50,
                    y: height - 50,
                    size: 24,
                    color: rgb(0, 0, 0)
                });

                page.drawText('Created with ImageTools', {
                    x: 50,
                    y: height - 80,
                    size: 12,
                    color: rgb(0.5, 0.5, 0.5)
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, 'blank.pdf');
            } catch (error) {
                console.error('Error creating PDF:', error);
                alert('Error creating PDF.');
            }
        };

        document.querySelector('[data-tool="pdf-create"]').createFromImages = function () {
            // Redirect to convert tool
            location.href = 'pdf-convert.html';
        };
    }
};

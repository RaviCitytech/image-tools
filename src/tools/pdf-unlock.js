// PDF Unlock Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-unlock'] = {
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
                <div class="tool-container" style="max-width: 600px; margin: 0 auto; padding: 3rem; text-align: center;">
                    <i class="fa-solid fa-unlock" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <h2>${pdfFile.name}</h2>
                    <p style="color: var(--text-muted); margin: 1.5rem 0;">
                        Enter the password to unlock this PDF
                    </p>
                    <div class="control-group" style="max-width: 400px; margin: 0 auto;">
                        <input type="password" id="pdfPassword" placeholder="Enter PDF password">
                    </div>
                    <div style="margin: 2rem 0;">
                        <button class="btn" onclick="document.querySelector('[data-tool=pdf-unlock]').unlockPDF()">
                            <i class="fa-solid fa-unlock"></i> Unlock PDF
                        </button>
                        <button class="btn btn-secondary" onclick="location.reload()" style="margin-left: 0.5rem;">Start Over</button>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">
                        Note: This tool can only unlock PDFs if you have the correct password.
                    </p>
                </div>
            `;
        }

        document.querySelector('[data-tool="pdf-unlock"]').unlockPDF = async function () {
            const password = document.getElementById('pdfPassword').value;

            if (!password) {
                alert('Please enter the PDF password.');
                return;
            }

            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const { PDFDocument } = PDFLib;

                // Try to load with password
                const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                window.AppUtils.downloadBlob(blob, `unlocked_${pdfFile.name}`);
                alert('PDF unlocked successfully!');
            } catch (error) {
                console.error('Error unlocking PDF:', error);
                alert('Error unlocking PDF. Please check the password or file.');
            }
        };
    }
};

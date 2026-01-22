// PDF Protect Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-protect'] = {
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
                <div class="tool-container" style="max-width: 600px; margin: 0 auto; padding: 3rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <i class="fa-solid fa-lock" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                        <h2>${pdfFile.name}</h2>
                    </div>
                    <div class="control-group">
                        <label class="control-label">User Password (required to open PDF)</label>
                        <input type="password" id="userPassword" placeholder="Enter password">
                    </div>
                    <div class="control-group">
                        <label class="control-label">Owner Password (optional, for editing permissions)</label>
                        <input type="password" id="ownerPassword" placeholder="Enter owner password">
                    </div>
                    <div style="margin: 2rem 0; text-align: center;">
                        <button class="btn" onclick="document.querySelector('[data-tool=pdf-protect]').protectPDF()">
                            <i class="fa-solid fa-lock"></i> Protect PDF
                        </button>
                        <button class="btn btn-secondary" onclick="location.reload()" style="margin-left: 0.5rem;">Start Over</button>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">
                        Note: Password protection is applied using standard PDF encryption.
                    </p>
                </div>
            `;
        }

        document.querySelector('[data-tool="pdf-protect"]').protectPDF = async function () {
            const userPassword = document.getElementById('userPassword').value;
            const ownerPassword = document.getElementById('ownerPassword').value || userPassword;

            if (!userPassword) {
                alert('Please enter a user password.');
                return;
            }

            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const { PDFDocument } = PDFLib;
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                // Encrypt the PDF
                // Note: standard-fonts module is required for encryption in some versions, but 
                // the UMD build typically includes necessary dependencies or falls back.
                // We'll perform standard RC4 128-bit encryption which is widely supported.
                pdfDoc.encrypt({
                    userPassword: userPassword,
                    ownerPassword: ownerPassword,
                    permissions: {
                        printing: 'highResolution',
                        modifying: false,
                        copying: false,
                        annotating: false,
                        fillingForms: false,
                        contentAccessibility: false,
                        documentAssembly: false,
                    },
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                window.AppUtils.downloadBlob(blob, `protected_${pdfFile.name}`);
                alert('Success! PDF has been password protected.');
            } catch (error) {
                console.error('Error protecting PDF:', error);
                alert('Error protecting PDF. If encryption fails, try a different browser or file.');
            }
        };
    }
};

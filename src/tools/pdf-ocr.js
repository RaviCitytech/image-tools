// PDF OCR Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-ocr'] = {
    init(uploadArea, editorArea, appState) {
        uploadArea.innerHTML = `
            <div class="drop-zone">
                <i class="fa-solid fa-font"></i>
                <p>Extract text from scanned PDFs using OCR</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
                    This feature is coming soon. OCR processing requires Tesseract.js integration and PDF rendering.
                </p>
                <button class="btn" onclick="location.href='index.html'" style="margin-top: 2rem;">
                    <i class="fa-solid fa-home"></i> Back to Home
                </button>
            </div>
        `;
    }
};

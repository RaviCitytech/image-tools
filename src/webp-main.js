// WEBP Conversion Page Entry Point
// Adapts main.js strategy for a single-tool page

const appState = {
    currentRoute: 'convert', // Hardcode to convert
    file: null,
    processedFile: null
};

// Simplified renderer for single tool
function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = ''; // Clean slate

    // Basic Tool Container Structure (matching main.js structure)
    // We already have back button from HTML if we copy structure, or we build it here.
    // Let's build it here to be safe and consistent.

    // Check if Tools loaded
    if (!window.Tools || !window.Tools.convert) {
        main.innerHTML = '<div class="alert">Tool not found. Please reload.</div>';
        return;
    }

    main.innerHTML = `
        <div class="tool-container">
            <div style="margin-bottom: 2rem;">
                <a href="index.html" class="btn btn-secondary"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            </div>
            <h2 id="tool-title" style="margin-bottom: 1rem;">Convert to WEBP</h2>
            
            <div id="upload-area" class="drop-zone">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3>Select images</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">or drag and drop them here</p>
                <p style="font-size: 0.8rem; color: var(--primary); margin-top: 1rem;">Bulk processing supported!</p>
            </div>

            <div id="editor-area" class="hidden">
            </div>
        </div>
    `;

    // Initialize Convert tool with fixed WEBP target
    window.Tools.convert.init(
        document.getElementById('upload-area'),
        document.getElementById('editor-area'),
        appState,
        { targetFormat: 'image/webp' }
    );
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Navigation handling not really needed for single page, but good to have safeguards
    render();

    // Quick link to home on logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onclick = () => window.location.href = 'index.html';
    }
});

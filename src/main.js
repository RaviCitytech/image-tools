// Main Entry Point
// No imports, uses globals from window.Tools and window.AppUtils

const ROUTES = {
    HOME: 'home',
    RESIZE: 'resize',
    CROP: 'crop',
    COMPRESS: 'compress',
    CONVERT: 'convert',
    ROTATE: 'rotate',
    WATERMARK: 'watermark',
    FILTER: 'filter'
};

const state = {
    currentRoute: ROUTES.HOME,
    file: null,
    processedFile: null
};

// Simple router
function navigate(route) {
    state.currentRoute = route;
    if (route === ROUTES.HOME) {
        state.file = null;
        state.processedFile = null;
    }
    render();
}

function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (state.currentRoute === ROUTES.HOME) {
        renderHome(main);
    } else {
        renderTool(main, state.currentRoute);
    }
}

function renderHome(container) {
    const tools = [
        { id: ROUTES.RESIZE, name: 'Resize Image', icon: 'fa-expand', desc: 'Diff dimensions? Resize many images at once.' },
        { id: ROUTES.CROP, name: 'Crop Image', icon: 'fa-crop-simple', desc: 'Crop JPG, PNG or GIF with ease.' },
        { id: ROUTES.COMPRESS, name: 'Compress Image', icon: 'fa-compress', desc: 'Compress massive amounts of images.' },
        { id: ROUTES.CONVERT, name: 'Convert to JPG', icon: 'fa-image', desc: 'Turn PNG, GIF, TIF, PSD, SVG, WEBP to JPG.' },
        { id: ROUTES.ROTATE, name: 'Rotate Image', icon: 'fa-rotate-right', desc: 'Rotate your images left or right.' },
        { id: ROUTES.WATERMARK, name: 'Watermark', icon: 'fa-stamp', desc: 'Stamp an image or text over your images.' },
        { id: ROUTES.FILTER, name: 'Photo Editor', icon: 'fa-wand-magic-sparkles', desc: 'Spice up your photos with filters.' }
    ];

    const hero = document.createElement('div');
    hero.style.textAlign = 'center';
    hero.style.marginBottom = '4rem';
    hero.innerHTML = `
        <h1 style="font-size: 3.5rem; margin-bottom: 1rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Every tool you could want
        </h1>
        <p style="font-size: 1.2rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">
            Your online photo editor. Create, edit, and modify images completely free in your browser.
        </p>
    `;

    const grid = document.createElement('div');
    grid.className = 'grid';

    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-icon"><i class="fa-solid ${tool.icon}"></i></div>
            <div class="card-title">${tool.name}</div>
            <div class="card-desc">${tool.desc}</div>
        `;
        card.onclick = () => navigate(tool.id);
        grid.appendChild(card);
    });

    container.appendChild(hero);
    container.appendChild(grid);
}

function renderTool(container, toolType) {
    // Basic Layout
    // For bulk supported tools, we update the instruction slightly
    const isBulkSupported = [ROUTES.RESIZE, ROUTES.COMPRESS, ROUTES.CONVERT].includes(toolType);

    container.innerHTML = `
        <div class="tool-container">
            <div style="margin-bottom: 2rem;">
                <button id="back-btn" class="btn btn-secondary"><i class="fa-solid fa-arrow-left"></i> Back to Home</button>
            </div>
            <h2 id="tool-title" style="margin-bottom: 1rem; text-transform: capitalize;">${toolType} Image</h2>
            
            <div id="upload-area" class="drop-zone">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3>Select image${isBulkSupported ? 's' : ''}</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">or drag and drop ${isBulkSupported ? 'them' : 'it'} here</p>
                ${isBulkSupported ? '<p style="font-size: 0.8rem; color: var(--primary); margin-top: 1rem;">Bulk processing supported!</p>' : ''}
            </div>

            <div id="editor-area" class="hidden">
            </div>
        </div>
    `;

    document.getElementById('back-btn').onclick = () => navigate(ROUTES.HOME);

    // Call Global Tool logic
    if (window.Tools && window.Tools[toolType]) {
        window.Tools[toolType].init(document.getElementById('upload-area'), document.getElementById('editor-area'), state);
    } else {
        container.innerHTML += `<div class="alert">Tool not found.</div>`;
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    render();
    document.querySelector('.logo').onclick = () => navigate(ROUTES.HOME);
});

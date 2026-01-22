// Shared Tool Loader

// This script expects a global 'TOOL_CONFIG' object script defined before it in the HTML,
// or a data attribute on the body/main element to ID the tool.
// For simplicity, we'll check the body data-tool attribute.

window.addEventListener('DOMContentLoaded', () => {
    const appState = {
        currentRoute: '',
        file: null,
        processedFile: null
    };

    const toolType = document.body.dataset.tool;
    if (!toolType) {
        console.error('No tool type defined in body data-tool attribute');
        return;
    }

    renderToolPage(toolType, appState);
    setupNavigation();
});

function setupNavigation() {
    // Handle logo click to go home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onclick = () => window.location.href = 'index.html';
    }

    // Handle any specific nav requirements
}

function renderToolPage(toolType, appState) {
    const main = document.getElementById('main-content');

    // Tools Dictionary for display names
    const TOOL_NAMES = {
        'resize': 'Resize Image',
        'crop': 'Crop Image',
        'compress': 'Compress Image',
        'convert': 'Convert Image',
        'rotate': 'Rotate Image',
        'watermark': 'Add Watermark',
        'filter': 'Photo Editor',
        'pdf-merge': 'Merge PDFs',
        'pdf-split': 'Split PDF',
        'pdf-compress': 'Compress PDF',
        'pdf-protect': 'Protect PDF',
        'pdf-unlock': 'Unlock PDF',
        'pdf-convert': 'Convert PDF',
        'pdf-edit': 'Edit PDF',
        'pdf-organize': 'Organize PDF Pages',
        'pdf-sign': 'Sign PDF',
        'pdf-watermark': 'Add PDF Watermark',
        'pdf-ocr': 'PDF OCR',
        'pdf-fill-forms': 'Fill PDF Forms',
        'pdf-create': 'Create PDF'
    };

    // Check if this is a PDF tool
    const isPDFTool = toolType.startsWith('pdf-');

    // Check bulk support for UI hint
    const isBulkSupported = ['resize', 'compress', 'convert', 'pdf-merge'].includes(toolType);

    // Determine file type text
    const fileTypeText = isPDFTool ? 'PDF' : 'image';
    const fileTypePlural = isPDFTool ? 'PDFs' : 'images';

    main.innerHTML = `
        <div class="tool-container">
            <div style="margin-bottom: 2rem;">
                <a href="index.html" class="btn btn-secondary"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            </div>
            <h2 id="tool-title" style="margin-bottom: 1rem; text-transform: capitalize;">${TOOL_NAMES[toolType] || toolType}</h2>
            
            <div id="upload-area" class="drop-zone">
                <i class="fa-solid ${isPDFTool ? 'fa-file-pdf' : 'fa-cloud-arrow-up'}" style="font-size: 4rem; color: ${isPDFTool ? '#ef4444' : 'var(--primary)'}; margin-bottom: 1rem;"></i>
                <h3>Select ${isBulkSupported ? fileTypePlural : fileTypeText}</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">or drag and drop ${isBulkSupported ? 'them' : 'it'} here</p>
                ${isBulkSupported ? '<p style="font-size: 0.8rem; color: var(--primary); margin-top: 1rem;">Bulk processing supported!</p>' : ''}
            </div>

            <div id="editor-area" class="hidden">
            </div>
        </div>
    `;

    // Initialize the specific tool
    if (window.Tools && window.Tools[toolType]) {
        window.Tools[toolType].init(document.getElementById('upload-area'), document.getElementById('editor-area'), appState);
    } else {
        main.innerHTML += `<div class="alert">Tool module '${toolType}' not loaded or found.</div>`;
    }
}

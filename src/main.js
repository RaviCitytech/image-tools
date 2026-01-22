// Main Entry Point - Home Page Only

function renderHome() {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    const imageTools = [
        { id: 'resize', name: 'Resize Image', icon: 'fa-expand', desc: 'Change dimensions while maintaining quality.', link: 'resize.html' },
        { id: 'crop', name: 'Crop Image', icon: 'fa-crop-simple', desc: 'Perfect cropping tool with aspect ratio presets.', link: 'crop.html' },
        { id: 'compress', name: 'Compress', icon: 'fa-compress', desc: 'Reduce file size with adjustable quality.', link: 'compress.html' },
        { id: 'convert', name: 'Convert Format', icon: 'fa-image', desc: 'Convert between JPG, PNG, WEBP, and more.', link: 'convert.html' },
        { id: 'rotate', name: 'Rotate & Mirror', icon: 'fa-rotate-right', desc: 'Rotate 90°/180° or mirror images instantly.', link: 'rotate.html' },
        { id: 'watermark', name: 'Watermark', icon: 'fa-stamp', desc: 'Protect images with text or logo watermarks.', link: 'watermark.html' },
        { id: 'filter', name: 'Filters', icon: 'fa-wand-magic-sparkles', desc: 'Apply grayscale, sepia, and other effects.', link: 'filter.html' },
        { id: 'webp-tool', name: 'WEBP Converter', icon: 'fa-file-image', desc: 'Dedicated tool for fast WebP conversion.', link: 'jpg-png-to-webp-v4.html' }
    ];

    const pdfTools = [
        { id: 'pdf-merge', name: 'PDF Merge', icon: 'fa-object-group', desc: 'Combine multiple PDFs into one document.', link: 'pdf-merge.html' },
        { id: 'pdf-split', name: 'PDF Split', icon: 'fa-scissors', desc: 'Separate pages or split into multiple files.', link: 'pdf-split.html' },
        { id: 'pdf-convert', name: 'PDF Convert', icon: 'fa-file-export', desc: 'Convert PDF to images and vice versa.', link: 'pdf-convert.html' },
        { id: 'pdf-organize', name: 'Organize Pages', icon: 'fa-list-ol', desc: 'Reorder, rotate, and delete PDF pages.', link: 'pdf-organize.html' },
        { id: 'pdf-sign', name: 'PDF Sign', icon: 'fa-signature', desc: 'Add digital or electronic signatures.', link: 'pdf-sign.html' },
        { id: 'pdf-watermark', name: 'PDF Watermark', icon: 'fa-droplet', desc: 'Add or remove watermarks from PDFs.', link: 'pdf-watermark.html' },
        { id: 'pdf-create', name: 'Create PDF', icon: 'fa-file-circle-plus', desc: 'Create PDF from any file or webpage.', link: 'pdf-create.html' }
    ];

    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML = `
        <h1>Professional Image & PDF Tools</h1>
        <p>
            Secure, client-side editing. No uploads, no signups, no limits.
            <br>The way it should be.
        </p>
    `;

    // Helper function to create tool cards
    const createToolCard = (tool, type) => {
        const card = document.createElement('div');
        card.className = `card tool-card-${tool.id} ${type}-tool`;
        card.setAttribute('itemscope', '');
        card.setAttribute('itemtype', 'https://schema.org/SoftwareApplication');
        card.onmousemove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        card.innerHTML = `
            <div class="card-icon"><i class="fa-solid ${tool.icon}" aria-hidden="true"></i></div>
            <h2 class="card-title" itemprop="name">${tool.name}</h2>
            <p class="card-desc" itemprop="description">${tool.desc}</p>
        `;
        card.onclick = () => {
            window.location.href = tool.link;
        };
        return card;
    };

    // Image Tools Section
    const imageSection = document.createElement('section');
    imageSection.className = 'tools-section';

    const imageHeader = document.createElement('div');
    imageHeader.className = 'section-header';
    imageHeader.innerHTML = `
        <i class="fa-solid fa-image"></i>
        <h2>Image Tools</h2>
    `;

    const imageGrid = document.createElement('div');
    imageGrid.className = 'grid';
    imageTools.forEach(tool => {
        imageGrid.appendChild(createToolCard(tool, 'image'));
    });

    imageSection.appendChild(imageHeader);
    imageSection.appendChild(imageGrid);

    // PDF Tools Section
    const pdfSection = document.createElement('section');
    pdfSection.className = 'tools-section';

    const pdfHeader = document.createElement('div');
    pdfHeader.className = 'section-header';
    pdfHeader.innerHTML = `
        <i class="fa-solid fa-file-pdf"></i>
        <h2>PDF Tools</h2>
    `;

    const pdfGrid = document.createElement('div');
    pdfGrid.className = 'grid';
    pdfTools.forEach(tool => {
        pdfGrid.appendChild(createToolCard(tool, 'pdf'));
    });

    pdfSection.appendChild(pdfHeader);
    pdfSection.appendChild(pdfGrid);

    // Add SEO content section
    const seoSection = document.createElement('section');
    seoSection.className = 'seo-section';
    seoSection.innerHTML = `
        <div class="seo-header">
            <h2>Why ImageTools?</h2>
            <p>
                Built for privacy and performance. All processing happens locally in your browser leveraging WebAssembly and modern Canvas APIs.
            </p>
        </div>
        
        <div class="features-grid">
            <div class="feature-item">
                <i class="fa-solid fa-shield-halved feature-icon"></i>
                <h3 class="feature-title">100% Private</h3>
                <p class="feature-desc">Your images never leave your device.</p>
            </div>
            <div class="feature-item">
                <i class="fa-solid fa-infinity feature-icon"></i>
                <h3 class="feature-title">Unlimited</h3>
                <p class="feature-desc">No daily limits or premium walls.</p>
            </div>
            <div class="feature-item">
                <i class="fa-solid fa-layer-group feature-icon"></i>
                <h3 class="feature-title">Bulk Actions</h3>
                <p class="feature-desc">Process hundreds of images at once.</p>
            </div>
            <div class="feature-item">
                <i class="fa-solid fa-bolt feature-icon"></i>
                <h3 class="feature-title">Instant</h3>
                <p class="feature-desc">Zero latency. No server queue.</p>
            </div>
        </div>
    `;

    container.appendChild(hero);
    container.appendChild(imageSection);
    container.appendChild(pdfSection);

    // Request a Tool Section
    const requestSection = document.createElement('div');
    requestSection.className = 'request-section';
    requestSection.style.textAlign = 'center';
    requestSection.style.margin = '4rem 0';

    // Construct Mailto Link
    const email = 'Ravi.Raushan@citytechsoftware.com';
    const subject = encodeURIComponent('Feature Request: New Image Tool');
    const body = encodeURIComponent(`Hi Team,

I would like to request a new tool for ImageTools.

**Tool Name:**
[Enter tool name here]

**Description/Functionality:**
[Describe what the tool should do]

**Why is this useful?**
[Explain the use case]

Thanks!`);

    requestSection.innerHTML = `
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Don't see what you're looking for?</p>
        <a href="mailto:${email}?subject=${subject}&body=${body}" class="btn">
            <i class="fa-solid fa-envelope"></i> Request a Tool
        </a>
    `;
    container.appendChild(requestSection);

    container.appendChild(seoSection);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    renderHome();
});

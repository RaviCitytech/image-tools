// Main Entry Point - Home Page Only

function renderHome() {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    const tools = [
        { id: 'resize', name: 'Resize Image', icon: 'fa-expand', desc: 'Change dimensions while maintaining quality.', link: 'resize.html' },
        { id: 'crop', name: 'Crop Image', icon: 'fa-crop-simple', desc: 'Perfect cropping tool with aspect ratio presets.', link: 'crop.html' },
        { id: 'compress', name: 'Compress', icon: 'fa-compress', desc: 'Reduce file size with adjustable quality.', link: 'compress.html' },
        { id: 'convert', name: 'Convert Format', icon: 'fa-image', desc: 'Convert between JPG, PNG, WEBP, and more.', link: 'convert.html' },
        { id: 'rotate', name: 'Rotate & Flip', icon: 'fa-rotate-right', desc: 'Rotate 90°/180° or flip images instantly.', link: 'rotate.html' },
        { id: 'watermark', name: 'Watermark', icon: 'fa-stamp', desc: 'Protect images with text or logo watermarks.', link: 'watermark.html' },
        { id: 'filter', name: 'Filters', icon: 'fa-wand-magic-sparkles', desc: 'Apply grayscale, sepia, and other effects.', link: 'filter.html' },
        { id: 'webp-tool', name: 'WEBP Converter', icon: 'fa-file-image', desc: 'Dedicated tool for fast WebP conversion.', link: 'jpg-png-to-webp-v4.html' }
    ];

    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.innerHTML = `
        <h1>Professional Image Tools</h1>
        <p>
            Secure, client-side image editing. No uploads, no signups, no limits.
            <br>The way it should be.
        </p>
    `;

    const grid = document.createElement('div');
    grid.className = 'grid';

    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('itemscope', '');
        card.setAttribute('itemtype', 'https://schema.org/SoftwareApplication');
        // Added onmousemove for the glow effect tracking
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
        grid.appendChild(card);
    });

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
    container.appendChild(grid);
    container.appendChild(seoSection);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    renderHome();
});

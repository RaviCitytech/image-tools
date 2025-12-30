// Main Entry Point - Home Page Only

function renderHome() {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    const tools = [
        { id: 'resize', name: 'Resize Image Online', icon: 'fa-expand', desc: 'Resize images online free with bulk processing. Change dimensions of multiple images at once while maintaining quality.', link: 'resize.html' },
        { id: 'crop', name: 'Crop Image', icon: 'fa-crop-simple', desc: 'Crop JPG, PNG, GIF, and WEBP images online. Perfect cropping tool with aspect ratio presets for social media.', link: 'crop.html' },
        { id: 'compress', name: 'Compress Image', icon: 'fa-compress', desc: 'Compress images online to reduce file size. Bulk image compression with adjustable quality for JPG and PNG files.', link: 'compress.html' },
        { id: 'convert', name: 'Convert to JPG', icon: 'fa-image', desc: 'Convert PNG to JPG, GIF to JPG, WEBP to JPG online free. Batch image format converter supporting all major formats.', link: 'convert.html' },
        { id: 'rotate', name: 'Rotate Image', icon: 'fa-rotate-right', desc: 'Rotate images online 90, 180, 270 degrees. Flip images horizontally or vertically with one click.', link: 'rotate.html' },
        { id: 'watermark', name: 'Add Watermark', icon: 'fa-stamp', desc: 'Add text watermark or image watermark to photos online. Protect your images with customizable watermarks.', link: 'watermark.html' },
        { id: 'filter', name: 'Photo Editor', icon: 'fa-wand-magic-sparkles', desc: 'Online photo editor with filters. Apply grayscale, sepia, blur, contrast, brightness, and invert effects to images.', link: 'filter.html' },
        { id: 'webp-tool', name: 'Convert to WEBP', icon: 'fa-file-image', desc: 'Convert JPG, PNG to WEBP online. Dedicated tool for fast and free WebP conversion.', link: 'jpg-png-to-webp-v4.html' }
    ];

    const hero = document.createElement('div');
    hero.style.textAlign = 'center';
    hero.style.marginBottom = '4rem';
    hero.innerHTML = `
        <h1 style="font-size: 3.5rem; margin-bottom: 1rem; background: linear-gradient(to right, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Free Online Image Editor - Professional Photo Editing Tools
        </h1>
        <p style="font-size: 1.2rem; color: var(--text-muted); max-width: 700px; margin: 0 auto;">
            Edit images online free with our powerful image editing tools. Resize, crop, compress, convert, rotate, watermark, and apply filters to your photos. No signup required. 100% free forever with bulk processing support.
        </p>
    `;

    const grid = document.createElement('div');
    grid.className = 'grid';

    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('itemscope', '');
        card.setAttribute('itemtype', 'https://schema.org/SoftwareApplication');
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
    seoSection.style.marginTop = '5rem';
    seoSection.style.maxWidth = '900px';
    seoSection.style.margin = '5rem auto 0';
    seoSection.style.padding = '0 2rem';
    seoSection.innerHTML = `
        <div style="text-align: center; margin-bottom: 3rem;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--text);">Why Choose ImageTools?</h2>
            <p style="color: var(--text-muted); line-height: 1.8;">
                ImageTools is a completely free online image editor that works entirely in your browser. 
                No software installation, no account creation, and no file uploads to servers. 
                Your images stay private and secure on your device while you edit them with professional-grade tools.
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div style="text-align: center;">
                <i class="fa-solid fa-shield-halved" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--text);">100% Private</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">All processing happens in your browser. Your images never leave your device.</p>
            </div>
            <div style="text-align: center;">
                <i class="fa-solid fa-infinity" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--text);">Unlimited Usage</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Edit unlimited images with no restrictions. Completely free forever.</p>
            </div>
            <div style="text-align: center;">
                <i class="fa-solid fa-layer-group" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--text);">Bulk Processing</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Process multiple images at once with our batch editing tools.</p>
            </div>
            <div style="text-align: center;">
                <i class="fa-solid fa-bolt" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--text);">Lightning Fast</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">No server uploads means instant processing and editing.</p>
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

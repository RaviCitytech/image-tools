
if (!window.Tools) window.Tools = {};

window.Tools.compress = {
    init(uploadArea, editorArea, appState) {
        let originalFiles = [];
        let firstImage = null;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            originalFiles = Array.from(files);
            firstImage = await window.AppUtils.loadImage(files[0]);
            showEditor();
        });

        function showEditor() {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            editorArea.innerHTML = '';

            const layout = document.createElement('div');
            layout.className = 'editor-layout';

            const previewArea = document.createElement('div');
            previewArea.className = 'preview-area';
            previewArea.appendChild(firstImage);

            if (originalFiles.length > 1) {
                const badge = document.createElement('div');
                badge.style.position = 'absolute';
                badge.style.top = '10px';
                badge.style.right = '10px';
                badge.style.background = 'var(--primary)';
                badge.style.color = 'white';
                badge.style.padding = '5px 10px';
                badge.style.borderRadius = '20px';
                badge.innerText = `+${originalFiles.length - 1} more files`;
                previewArea.appendChild(badge);
            }

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <div style="font-size: 0.9rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                    <p><strong>Total Files:</strong> ${originalFiles.length}</p>
                    <p><strong>First File Size:</strong> ${window.AppUtils.formatBytes(originalFiles[0].size)}</p>
                </div>
            `;
            sidebar.appendChild(infoDiv);

            const qualityContainer = document.createElement('div');
            qualityContainer.className = 'control-group';
            const qualityLabel = document.createElement('label');
            qualityLabel.className = 'control-label';
            const qualityInput = document.createElement('input');
            qualityInput.type = 'range';
            qualityInput.min = '1';
            qualityInput.max = '95';
            qualityInput.value = '75';

            const valDisplay = document.createElement('span');
            valDisplay.style.float = 'right';

            const updateLabel = () => {
                qualityLabel.innerText = 'JPEG Quality';
                valDisplay.innerText = qualityInput.value + '%';
            };
            updateLabel();
            qualityLabel.appendChild(valDisplay);

            qualityInput.oninput = updateLabel;
            qualityContainer.append(qualityLabel, qualityInput);

            const compressBtn = document.createElement('button');
            compressBtn.className = 'btn';
            compressBtn.innerText = originalFiles.length > 1 ? 'Compress All & Zip' : 'Compress & Download';
            compressBtn.style.marginTop = '1rem';
            compressBtn.style.width = '100%';

            compressBtn.onclick = async () => {
                const quality = parseInt(qualityInput.value) / 100;
                if (originalFiles.length === 1) {
                    processCompressSingle(originalFiles[0], firstImage, quality);
                } else {
                    await processCompressBulk(quality);
                }
            };

            sidebar.append(qualityContainer, compressBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        function compressCanvas(img, quality) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            return canvas;
        }

        function processCompressSingle(file, img, quality) {
            const canvas = compressCanvas(img, quality);
            // Defaulting to JPG for compression effect in this simple tool
            canvas.toBlob((blob) => {
                window.AppUtils.downloadBlob(blob, `compressed_${file.name.split('.')[0]}.jpg`);
            }, 'image/jpeg', quality);
        }

        async function processCompressBulk(quality) {
            const processed = [];
            for (const file of originalFiles) {
                const img = await window.AppUtils.loadImage(file);
                const canvas = compressCanvas(img, quality);
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
                processed.push({ name: `compressed_${file.name.split('.')[0]}.jpg`, blob: blob });
            }
            window.AppUtils.downloadZip(processed, 'compressed_images.zip');
        }
    }
};

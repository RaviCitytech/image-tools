
if (!window.Tools) window.Tools = {};

window.Tools.crop = {
    init(uploadArea, editorArea, appState) {
        let cropper = null;
        let originalFile = null;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            const file = files[0];
            originalFile = file;
            const img = await window.AppUtils.loadImage(file);
            showEditor(img);
        });

        function showEditor(imgElement) {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            editorArea.innerHTML = '';

            const layout = document.createElement('div');
            layout.className = 'editor-layout';

            const previewArea = document.createElement('div');
            previewArea.className = 'preview-area';
            imgElement.style.maxWidth = '100%';
            imgElement.id = 'crop-target';
            previewArea.appendChild(imgElement);

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'grid';
            btnGroup.style.gridTemplateColumns = '1fr 1fr';
            btnGroup.style.gap = '10px';

            const actions = [
                { label: '16:9', ratio: 16 / 9 },
                { label: '9:16', ratio: 9 / 16 },
                { label: '4:3', ratio: 4 / 3 },
                { label: '3:2', ratio: 3 / 2 },
                { label: '2:3', ratio: 2 / 3 },
                { label: '5:4', ratio: 5 / 4 },
                { label: '1:1', ratio: 1 },
                { label: 'Free', ratio: NaN },
            ];

            actions.forEach(act => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.innerText = act.label;
                btn.onclick = () => {
                    cropper.setAspectRatio(act.ratio);
                };
                btnGroup.appendChild(btn);
            });

            const cropBtn = document.createElement('button');
            cropBtn.className = 'btn';
            cropBtn.innerText = 'Crop & Download';
            cropBtn.style.marginTop = '2rem';
            cropBtn.style.width = '100%';
            cropBtn.onclick = () => {
                const canvas = cropper.getCroppedCanvas();
                canvas.toBlob((blob) => {
                    window.AppUtils.downloadBlob(blob, `cropped_${originalFile.name}`);
                }, originalFile.type);
            };

            sidebar.appendChild(btnGroup);

            // Quality Control
            const qualityGroup = document.createElement('div');
            qualityGroup.style.margin = '1.5rem 0';

            const qualityLabel = document.createElement('label');
            qualityLabel.innerText = 'Quality: 100%';
            qualityLabel.style.display = 'block';
            qualityLabel.style.marginBottom = '0.5rem';
            qualityLabel.style.fontSize = '0.9rem';
            qualityLabel.style.color = 'var(--text-muted)';

            const qualityInput = document.createElement('input');
            qualityInput.type = 'range';
            qualityInput.min = '1';
            qualityInput.max = '100';
            qualityInput.value = '100';
            qualityInput.style.width = '100%';
            qualityInput.style.accentColor = 'var(--primary)';

            qualityInput.oninput = (e) => {
                qualityLabel.innerText = `Quality: ${e.target.value}%`;
            };

            qualityGroup.append(qualityLabel, qualityInput);
            sidebar.appendChild(qualityGroup);
            sidebar.appendChild(cropBtn);

            cropBtn.onclick = () => {
                const canvas = cropper.getCroppedCanvas();
                const quality = parseInt(qualityInput.value) / 100;

                // Allow formats that support quality (jpeg, webp). Default png does not.
                // If original is png, it might be lossless, but user asking for quality implies lossy is okay or desired?
                // Standard behavior: if user lowers quality, we might forcedly map to jpeg if png?
                // START_DECISION: Keep original type but strictly apply quality param if supported.
                // Note: canvas.toBlob(callback, type, quality)

                canvas.toBlob((blob) => {
                    window.AppUtils.downloadBlob(blob, `cropped_${originalFile.name}`);
                }, originalFile.type, quality);
            };

            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);

            setTimeout(() => {
                cropper = new Cropper(imgElement, {
                    viewMode: 1,
                    background: false,
                    responsive: true,
                });
            }, 100);
        }
    }
};

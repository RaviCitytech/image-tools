
if (!window.Tools) window.Tools = {};

window.Tools.rotate = {
    init(uploadArea, editorArea, appState) {
        let currentImage = null;
        let originalFile = null;
        let rotation = 0;
        let scaleX = 1;
        let scaleY = 1;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            // Rotate tool currently supports single file for UI simplicity in this iteration
            // We can expand to bulk later if needed, but UI is complex for per-image rotation
            if (files.length > 1) {
                alert('Rotate tool currently supports one image at a time.');
            }
            originalFile = files[0];
            currentImage = await window.AppUtils.loadImage(files[0]);
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

            // We use a canvas for preview to show rotation real-time
            const canvas = document.createElement('canvas');
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '600px';
            previewArea.appendChild(canvas);

            function updatePreview() {
                // Calculate new canvas bounds
                const rad = rotation * Math.PI / 180;
                const sin = Math.abs(Math.sin(rad));
                const cos = Math.abs(Math.cos(rad));
                const w = currentImage.naturalWidth;
                const h = currentImage.naturalHeight;

                canvas.width = w * cos + h * sin;
                canvas.height = w * sin + h * cos;

                const ctx = canvas.getContext('2d');
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(rad);
                ctx.scale(scaleX, scaleY);
                ctx.drawImage(currentImage, -w / 2, -h / 2);
            }
            updatePreview();

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            const btnGroup = document.createElement('div');
            btnGroup.className = 'grid';
            btnGroup.style.gridTemplateColumns = '1fr 1fr';
            btnGroup.style.gap = '1rem';

            const actions = [
                { icon: 'fa-rotate-left', label: 'Left', fn: () => rotation -= 90 },
                { icon: 'fa-rotate-right', label: 'Right', fn: () => rotation += 90 },
                { icon: 'fa-arrows-left-right', label: 'Flip H', fn: () => scaleX *= -1 },
                { icon: 'fa-arrows-up-down', label: 'Flip V', fn: () => scaleY *= -1 },
            ];

            actions.forEach(act => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.innerHTML = `<i class="fa-solid ${act.icon}"></i> ${act.label}`;
                btn.onclick = () => {
                    act.fn();
                    updatePreview();
                };
                btnGroup.appendChild(btn);
            });

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn';
            saveBtn.innerText = 'Save Image';
            saveBtn.style.marginTop = '2rem';
            saveBtn.style.width = '100%';
            saveBtn.onclick = () => {
                canvas.toBlob((blob) => {
                    window.AppUtils.downloadBlob(blob, `rotated_${originalFile.name}`);
                }, originalFile.type);
            };

            sidebar.append(btnGroup, saveBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }
    }
};

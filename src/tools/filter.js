
if (!window.Tools) window.Tools = {};

window.Tools.filter = {
    init(uploadArea, editorArea, appState) {
        let currentImage = null;
        let originalFile = null;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files.length > 1) alert('Filter tool currently supports one image at a time.');
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

            const canvas = document.createElement('canvas');
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '600px';
            previewArea.appendChild(canvas);

            let activeFilter = 'none';

            function draw() {
                canvas.width = currentImage.naturalWidth;
                canvas.height = currentImage.naturalHeight;
                const ctx = canvas.getContext('2d');

                // Apply filter
                ctx.filter = activeFilter;
                ctx.drawImage(currentImage, 0, 0);
            }
            draw();

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            const filters = [
                { name: 'None', val: 'none' },
                { name: 'Grayscale', val: 'grayscale(100%)' },
                { name: 'Sepia', val: 'sepia(100%)' },
                { name: 'Invert', val: 'invert(100%)' },
                { name: 'Blur', val: 'blur(5px)' },
                { name: 'Brightness', val: 'brightness(150%)' },
                { name: 'Contrast', val: 'contrast(150%)' }
            ];

            const btnContainer = document.createElement('div');
            btnContainer.className = 'grid';
            btnContainer.style.gridTemplateColumns = '1fr 1fr';
            btnContainer.style.gap = '10px';

            filters.forEach(f => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.innerText = f.name;
                btn.onclick = () => {
                    activeFilter = f.val;
                    draw();
                };
                btnContainer.appendChild(btn);
            });

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn';
            saveBtn.innerText = 'Save Image';
            saveBtn.style.marginTop = '2rem';
            saveBtn.style.width = '100%';
            saveBtn.onclick = () => {
                canvas.toBlob((blob) => {
                    window.AppUtils.downloadBlob(blob, `filtered_${originalFile.name}`);
                }, originalFile.type);
            };

            sidebar.append(btnContainer, saveBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }
    }
};

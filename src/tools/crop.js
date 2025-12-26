
if (!window.Tools) window.Tools = {};

window.Tools.crop = {
    init(uploadArea, editorArea, appState) {
        let cropper = null;
        let originalFile = null;

        window.AppUtils.setupUpload(uploadArea, async (file) => {
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
                { label: '4:3', ratio: 4 / 3 },
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
            sidebar.appendChild(cropBtn);

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

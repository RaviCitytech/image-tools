
if (!window.Tools) window.Tools = {};

window.Tools.convert = {
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

            const formatContainer = document.createElement('div');
            formatContainer.className = 'control-group';
            const lbl = document.createElement('label');
            lbl.className = 'control-label';
            lbl.innerText = 'Target Format';

            const select = document.createElement('select');
            const formats = [
                { val: 'image/jpeg', label: 'JPG' },
                { val: 'image/png', label: 'PNG' },
                { val: 'image/webp', label: 'WEBP' }
            ];

            formats.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.val;
                opt.innerText = f.label;
                select.appendChild(opt);
            });
            formatContainer.append(lbl, select);

            const convertBtn = document.createElement('button');
            convertBtn.className = 'btn';
            convertBtn.innerText = originalFiles.length > 1 ? 'Convert All & Zip' : 'Convert & Download';
            convertBtn.style.marginTop = '1rem';
            convertBtn.style.width = '100%';

            convertBtn.onclick = async () => {
                const mime = select.value;
                if (originalFiles.length === 1) {
                    processConvertSingle(originalFiles[0], firstImage, mime);
                } else {
                    await processConvertBulk(mime);
                }
            };

            sidebar.append(formatContainer, convertBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        function processConvertSingle(file, img, mimeType) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            if (mimeType === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);

            const ext = mimeType.split('/')[1];
            canvas.toBlob((blob) => {
                window.AppUtils.downloadBlob(blob, `converted_${file.name.split('.')[0]}.${ext}`);
            }, mimeType, 0.9);
        }

        async function processConvertBulk(mimeType) {
            const processed = [];
            const ext = mimeType.split('/')[1];

            for (const file of originalFiles) {
                const img = await window.AppUtils.loadImage(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (mimeType === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);

                const blob = await new Promise(r => canvas.toBlob(r, mimeType, 0.9));
                processed.push({ name: `converted_${file.name.split('.')[0]}.${ext}`, blob: blob });
            }
            window.AppUtils.downloadZip(processed, 'converted_images.zip');
        }
    }
};

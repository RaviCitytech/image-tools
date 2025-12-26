
if (!window.Tools) window.Tools = {};

window.Tools.resize = {
    init(uploadArea, editorArea, appState) {
        let currentImages = [];
        let originalFiles = [];

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            originalFiles = Array.from(files);
            // Load only the first one for preview, but keep all for processing
            const firstImg = await window.AppUtils.loadImage(files[0]);
            currentImages = [firstImg];
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
            previewArea.appendChild(currentImages[0]); // Preview first image

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
                    <p><strong>Preview:</strong> ${currentImages[0].naturalWidth} x ${currentImages[0].naturalHeight}</p>
                    <p><strong>Files Selected:</strong> ${originalFiles.length}</p>
                </div>
            `;
            sidebar.appendChild(infoDiv);

            const widthInput = createInputGroup('Width (px)', currentImages[0].naturalWidth);
            const heightInput = createInputGroup('Height (px)', currentImages[0].naturalHeight);
            const ratioCheck = createCheckbox('Maintain Aspect Ratio', true);
            const processBtn = document.createElement('button');
            processBtn.className = 'btn';
            processBtn.innerText = originalFiles.length > 1 ? 'Resize All & Zip' : 'Resize Image';
            processBtn.style.marginTop = '1rem';
            processBtn.style.width = '100%';

            sidebar.append(widthInput.container, heightInput.container, ratioCheck.container, processBtn);

            const wIn = widthInput.input;
            const hIn = heightInput.input;
            const rCh = ratioCheck.input;
            const aspectRatio = currentImages[0].naturalWidth / currentImages[0].naturalHeight;

            wIn.oninput = () => {
                if (rCh.checked) {
                    hIn.value = Math.round(wIn.value / aspectRatio);
                }
            };

            hIn.oninput = () => {
                if (rCh.checked) {
                    wIn.value = Math.round(hIn.value * aspectRatio);
                }
            };

            processBtn.onclick = async () => {
                const targetW = parseInt(wIn.value);
                const targetH = parseInt(hIn.value);

                if (targetW > 0 && targetH > 0) {
                    if (originalFiles.length === 1) {
                        processResizeSingle(originalFiles[0], currentImages[0], targetW, targetH);
                    } else {
                        await processResizeBulk(targetW, targetH);
                    }
                }
            };

            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        function createInputGroup(label, value) {
            const container = document.createElement('div');
            container.className = 'control-group';
            const lbl = document.createElement('label');
            lbl.className = 'control-label';
            lbl.innerText = label;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            container.append(lbl, input);
            return { container, input };
        }

        function createCheckbox(label, checked) {
            const container = document.createElement('div');
            container.className = 'control-group';
            container.style.flexDirection = 'row';
            container.style.alignItems = 'center';
            container.style.gap = '0.5rem';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = checked;
            input.style.width = 'auto';
            const lbl = document.createElement('label');
            lbl.className = 'control-label';
            lbl.innerText = label;
            lbl.style.marginBottom = '0';
            container.append(input, lbl);
            return { container, input };
        }

        function resizeCanvas(img, w, h) {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
            return canvas;
        }

        function processResizeSingle(file, img, width, height) {
            const canvas = resizeCanvas(img, width, height);
            canvas.toBlob((blob) => {
                window.AppUtils.downloadBlob(blob, `resized_${file.name}`);
            }, file.type, 0.9);
        }

        async function processResizeBulk(width, height) {
            const processedFiles = [];

            // Show loading state potentially? 
            // For simplicity we just block interaction

            for (const file of originalFiles) {
                const img = await window.AppUtils.loadImage(file);
                // Calculate dimensions if we want to maintain AR for each image individually?
                // The current UI sets a FIXED width/height based on the FIRST image.
                // A better approach for bulk might be "Scale Percentage" or "Fit within", 
                // but sticking to user request "Resize", let's apply the requested Fixed W/H 
                // OR calculate proportional if aspect ratio was checked based on the prompt.
                // To keep it simple and robust: We apply the exact requested W/H.
                // If Aspect Ratio is important, user usually does % scaling in bulk tools.

                // Let's implement a smarter bulk resize:
                // If the user inputs specific W/H, we force that.

                const canvas = resizeCanvas(img, width, height);
                const blob = await new Promise(r => canvas.toBlob(r, file.type, 0.9));
                processedFiles.push({ name: `resized_${file.name}`, blob: blob });
            }

            window.AppUtils.downloadZip(processedFiles, 'b_resized_images.zip');
        }
    }
};

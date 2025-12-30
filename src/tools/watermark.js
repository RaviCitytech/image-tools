
if (!window.Tools) window.Tools = {};

window.Tools.watermark = {
    init(uploadArea, editorArea, appState) {
        let currentImage = null;
        let originalFile = null;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files.length > 1) alert('Watermark tool currently supports one image at a time.');
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

            // Watermark State
            const wmState = {
                text: 'Watermark',
                size: 40,
                color: '#ffffff',
                opacity: 0.5,
                rotation: 0,
                x: 50, // Percentage
                y: 50
            };

            function draw() {
                canvas.width = currentImage.naturalWidth;
                canvas.height = currentImage.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(currentImage, 0, 0);

                ctx.save();
                ctx.fillStyle = wmState.color;
                ctx.globalAlpha = wmState.opacity;
                ctx.font = `bold ${wmState.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const posX = (wmState.x / 100) * canvas.width;
                const posY = (wmState.y / 100) * canvas.height;

                ctx.translate(posX, posY);
                ctx.rotate((wmState.rotation * Math.PI) / 180);

                // Draw text at 0,0 relative to translated origin
                ctx.fillText(wmState.text, 0, 0);

                ctx.restore();
            }
            // Initial draw
            requestAnimationFrame(draw);

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            // Controls
            const textInput = createInput('Text', 'text', wmState.text, (v) => { wmState.text = v; draw(); });
            const sizeInput = createInput('Size (px)', 'number', wmState.size, (v) => { wmState.size = parseInt(v); draw(); });
            const colorInput = createInput('Color', 'color', wmState.color, (v) => { wmState.color = v; draw(); });
            const opacityInput = createRange('Opacity', 0, 1, 0.1, wmState.opacity, (v) => { wmState.opacity = parseFloat(v); draw(); });
            const rotateInput = createRange('Rotation (deg)', 0, 360, 1, wmState.rotation, (v) => { wmState.rotation = parseInt(v); draw(); });
            const xInput = createRange('Position X (%)', 0, 100, 1, wmState.x, (v) => { wmState.x = parseInt(v); draw(); });
            const yInput = createRange('Position Y (%)', 0, 100, 1, wmState.y, (v) => { wmState.y = parseInt(v); draw(); });

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn';
            saveBtn.innerText = 'Add Watermark & Save';
            saveBtn.style.marginTop = '1rem';
            saveBtn.style.width = '100%';
            saveBtn.onclick = () => {
                canvas.toBlob((blob) => {
                    window.AppUtils.downloadBlob(blob, `watermarked_${originalFile.name}`);
                }, originalFile.type);
            };

            sidebar.append(textInput, sizeInput, colorInput, opacityInput, rotateInput, xInput, yInput, saveBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        function createInput(label, type, val, onChange) {
            const div = document.createElement('div');
            div.className = 'control-group';
            div.innerHTML = `<label class="control-label">${label}</label>`;
            const inp = document.createElement('input');
            inp.type = type;
            inp.value = val;
            inp.oninput = (e) => onChange(e.target.value);
            div.appendChild(inp);
            return div;
        }

        function createRange(label, min, max, step, val, onChange) {
            const div = document.createElement('div');
            div.className = 'control-group';
            div.innerHTML = `<label class="control-label">${label}</label>`;
            const inp = document.createElement('input');
            inp.type = 'range';
            inp.min = min;
            inp.max = max;
            inp.step = step;
            inp.value = val;
            inp.oninput = (e) => onChange(e.target.value);
            div.appendChild(inp);
            return div;
        }
    }
};

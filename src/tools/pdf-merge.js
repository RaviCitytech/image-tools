// PDF Merge Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-merge'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFiles = [];

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf');
            if (pdfFiles.length > 0) {
                showEditor();
            } else {
                alert('Please upload PDF files only.');
            }
        }, 'application/pdf');

        function showEditor() {
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            editorArea.innerHTML = '';

            const layout = document.createElement('div');
            layout.className = 'editor-layout';

            const previewArea = document.createElement('div');
            previewArea.className = 'preview-area';
            previewArea.innerHTML = `
                <div style="text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-file-pdf" style="font-size: 4rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <h3 id="merge-count">${pdfFiles.length} PDF file(s) selected</h3>
                    <p>Ready to merge</p>
                </div>
            `;

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            const fileListContainer = document.createElement('div');
            fileListContainer.innerHTML = '<div class="control-label">Files to Merge (Order matters):</div>';
            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.padding = '0';
            list.style.margin = '0.5rem 0';

            function renderFileList() {
                list.innerHTML = '';
                pdfFiles.forEach((file, idx) => {
                    const li = document.createElement('li');
                    li.style.padding = '0.5rem';
                    li.style.marginBottom = '0.25rem';
                    li.style.background = 'var(--surface-hover)';
                    li.style.borderRadius = '4px';
                    li.style.fontSize = '0.85rem';
                    li.style.display = 'flex';
                    li.style.alignItems = 'center';
                    li.style.justifyContent = 'space-between';

                    const nameSpan = document.createElement('span');
                    nameSpan.style.overflow = 'hidden';
                    nameSpan.style.textOverflow = 'ellipsis';
                    nameSpan.style.whiteSpace = 'nowrap';
                    nameSpan.style.marginRight = '0.5rem';
                    nameSpan.innerHTML = `<strong>${idx + 1}.</strong> ${file.name}`;

                    const controls = document.createElement('div');
                    controls.style.display = 'flex';
                    controls.style.gap = '0.25rem';

                    if (idx > 0) {
                        const upBtn = document.createElement('button');
                        upBtn.className = 'btn-icon';
                        upBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
                        upBtn.title = "Move Up";
                        upBtn.style.padding = '2px 6px';
                        upBtn.style.fontSize = '0.7rem';
                        upBtn.onclick = () => moveFile(idx, -1);
                        controls.appendChild(upBtn);
                    }

                    if (idx < pdfFiles.length - 1) {
                        const downBtn = document.createElement('button');
                        downBtn.className = 'btn-icon';
                        downBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
                        downBtn.title = "Move Down";
                        downBtn.style.padding = '2px 6px';
                        downBtn.style.fontSize = '0.7rem';
                        downBtn.onclick = () => moveFile(idx, 1);
                        controls.appendChild(downBtn);
                    }

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'btn-icon';
                    removeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
                    removeBtn.title = "Remove";
                    removeBtn.style.padding = '2px 6px';
                    removeBtn.style.fontSize = '0.7rem';
                    removeBtn.style.color = '#ef4444';
                    removeBtn.onclick = () => removeFile(idx);
                    controls.appendChild(removeBtn);

                    li.append(nameSpan, controls);
                    list.appendChild(li);
                });

                // Update header count
                const countEl = document.getElementById('merge-count');
                if (countEl) countEl.innerText = `${pdfFiles.length} PDF file(s) selected`;
            }

            function moveFile(idx, direction) {
                const item = pdfFiles[idx];
                pdfFiles.splice(idx, 1);
                pdfFiles.splice(idx + direction, 0, item);
                renderFileList();
            }

            function removeFile(idx) {
                pdfFiles.splice(idx, 1);
                if (pdfFiles.length === 0) {
                    location.reload();
                } else {
                    renderFileList();
                }
            }

            renderFileList();
            fileListContainer.appendChild(list);

            const mergeBtn = document.createElement('button');
            mergeBtn.className = 'btn';
            mergeBtn.innerHTML = '<i class="fa-solid fa-object-group"></i> Merge PDFs';
            mergeBtn.style.marginTop = '1rem';
            mergeBtn.style.width = '100%';
            mergeBtn.onclick = async () => await mergePDFs();

            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn btn-secondary';
            resetBtn.innerText = 'Start Over';
            resetBtn.style.marginTop = '0.5rem';
            resetBtn.style.width = '100%';
            resetBtn.onclick = () => location.reload();

            sidebar.append(fileListContainer, mergeBtn, resetBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        async function mergePDFs() {
            try {
                const { PDFDocument } = PDFLib;
                const mergedPdf = await PDFDocument.create();

                for (const file of pdfFiles) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await PDFDocument.load(arrayBuffer);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }

                const mergedPdfBytes = await mergedPdf.save();
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, 'merged.pdf');
            } catch (error) {
                console.error('Error merging PDFs:', error);
                alert('Error merging PDFs. Please ensure all files are valid PDFs.');
            }
        }
    }
};

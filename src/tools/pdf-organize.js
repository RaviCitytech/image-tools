// PDF Organize Pages Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-organize'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFile = null;
        let pdfDoc = null;
        let pageOrder = []; // Array of original indices
        let totalPages = 0;

        window.AppUtils.setupUpload(uploadArea, async (files) => {
            if (files[0].type === 'application/pdf') {
                pdfFile = files[0];
                await loadPDF();
            } else {
                alert('Please upload a PDF file.');
            }
        }, 'application/pdf');

        async function loadPDF() {
            try {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const { PDFDocument } = PDFLib;
                pdfDoc = await PDFDocument.load(arrayBuffer);
                totalPages = pdfDoc.getPageCount();
                pageOrder = Array.from({ length: totalPages }, (_, i) => i);
                showEditor();
            } catch (error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF.');
            }
        }

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
                    <i class="fa-solid fa-list-ol" style="font-size: 4rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <h3 id="page-count">${pageOrder.length} Pages</h3>
                    <p>Reorder or delete pages</p>
                </div>
            `;

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';
            sidebar.style.display = 'flex';
            sidebar.style.flexDirection = 'column';

            const listContainer = document.createElement('div');
            listContainer.style.flex = '1';
            listContainer.style.overflowY = 'auto';
            listContainer.className = 'page-list-container';

            const list = document.createElement('ul');
            list.style.listStyle = 'none';
            list.style.padding = '0';
            list.style.margin = '0';

            function renderPageList() {
                list.innerHTML = '';
                if (pageOrder.length === 0) {
                    list.innerHTML = '<li style="padding:1rem; text-align:center; color:var(--text-muted);">No pages remaining</li>';
                    return;
                }

                pageOrder.forEach((originalIndex, idx) => {
                    const li = document.createElement('li');
                    li.style.padding = '0.75rem';
                    li.style.marginBottom = '0.5rem';
                    li.style.background = 'var(--surface-hover)';
                    li.style.borderRadius = '6px';
                    li.style.display = 'flex';
                    li.style.alignItems = 'center';
                    li.style.justifyContent = 'space-between';
                    li.style.border = '1px solid var(--border)';

                    const label = document.createElement('span');
                    label.innerHTML = `<strong>Page ${idx + 1}</strong> <span style='font-size:0.8em; color:var(--text-muted)'>(Original: ${originalIndex + 1})</span>`;

                    const controls = document.createElement('div');
                    controls.style.display = 'flex';
                    controls.style.gap = '0.5rem';

                    if (idx > 0) {
                        const upBtn = document.createElement('button');
                        upBtn.className = 'btn-icon';
                        upBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
                        upBtn.onclick = () => movePage(idx, -1);
                        controls.appendChild(upBtn);
                    }

                    if (idx < pageOrder.length - 1) {
                        const downBtn = document.createElement('button');
                        downBtn.className = 'btn-icon';
                        downBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
                        downBtn.onclick = () => movePage(idx, 1);
                        controls.appendChild(downBtn);
                    }

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-icon';
                    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    delBtn.style.color = '#ef4444';
                    delBtn.onclick = () => removePage(idx);
                    controls.appendChild(delBtn);

                    li.append(label, controls);
                    list.appendChild(li);
                });

                // Update count
                const countEl = document.getElementById('page-count');
                if (countEl) countEl.innerText = `${pageOrder.length} Pages`;
            }

            function movePage(idx, direction) {
                const item = pageOrder[idx];
                pageOrder.splice(idx, 1);
                pageOrder.splice(idx + direction, 0, item);
                renderPageList();
            }

            function removePage(idx) {
                pageOrder.splice(idx, 1);
                renderPageList();
            }

            renderPageList();
            listContainer.appendChild(list);

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn';
            saveBtn.innerHTML = '<i class="fa-solid fa-download"></i> Save PDF';
            saveBtn.style.marginTop = '1rem';
            saveBtn.style.width = '100%';
            saveBtn.onclick = async () => await savePDF();

            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn btn-secondary';
            resetBtn.innerText = 'Start Over';
            resetBtn.style.marginTop = '0.5rem';
            resetBtn.style.width = '100%';
            resetBtn.onclick = () => location.reload();

            sidebar.append(listContainer, saveBtn, resetBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        async function savePDF() {
            try {
                if (pageOrder.length === 0) {
                    alert('Cannot save an empty PDF.');
                    return;
                }

                const { PDFDocument } = PDFLib;
                const newPdf = await PDFDocument.create();

                // Copy pages specifically from current indices
                const copiedPages = await newPdf.copyPages(pdfDoc, pageOrder);
                copiedPages.forEach((page) => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, `organized_${pdfFile.name}`);
            } catch (error) {
                console.error('Error saving PDF:', error);
                alert('Error saving PDF.');
            }
        }
    }
};

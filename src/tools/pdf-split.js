// PDF Split Tool
if (!window.Tools) window.Tools = {};

window.Tools['pdf-split'] = {
    init(uploadArea, editorArea, appState) {
        let pdfFile = null;
        let pdfDoc = null;
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
            const arrayBuffer = await pdfFile.arrayBuffer();
            const { PDFDocument } = PDFLib;
            pdfDoc = await PDFDocument.load(arrayBuffer);
            totalPages = pdfDoc.getPageCount();
            showEditor();
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
                    <i class="fa-solid fa-scissors" style="font-size: 4rem; margin-bottom: 1rem; color: #ef4444;"></i>
                    <h3>${pdfFile.name}</h3>
                    <p>${totalPages} pages</p>
                </div>
            `;

            const sidebar = document.createElement('div');
            sidebar.className = 'controls-sidebar';

            sidebar.innerHTML = `
                <div class="control-group">
                    <label class="control-label">Page Range (e.g., 1-3, 5, 7-9)</label>
                    <input type="text" id="pageRange" placeholder="1-${totalPages}" value="1-${totalPages}">
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                    Enter page numbers or ranges separated by commas
                </div>
            `;

            const splitBtn = document.createElement('button');
            splitBtn.className = 'btn';
            splitBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> Extract Pages';
            splitBtn.style.marginTop = '1rem';
            splitBtn.style.width = '100%';
            splitBtn.onclick = async () => await splitPDF();

            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn btn-secondary';
            resetBtn.innerText = 'Start Over';
            resetBtn.style.marginTop = '0.5rem';
            resetBtn.style.width = '100%';
            resetBtn.onclick = () => location.reload();

            sidebar.append(splitBtn, resetBtn);
            layout.append(previewArea, sidebar);
            editorArea.appendChild(layout);
        }

        async function splitPDF() {
            try {
                const pageRangeInput = document.getElementById('pageRange').value;
                const pages = parsePageRange(pageRangeInput, totalPages);

                if (pages.length === 0) {
                    alert('Invalid page range');
                    return;
                }

                const { PDFDocument } = PDFLib;
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pages.map(p => p - 1));
                copiedPages.forEach((page) => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                window.AppUtils.downloadBlob(blob, `split_pages_${pages.join('-')}.pdf`);
            } catch (error) {
                console.error('Error splitting PDF:', error);
                alert('Error splitting PDF. Please check your page range.');
            }
        }

        function parsePageRange(rangeStr, maxPages) {
            const pages = new Set();
            const parts = rangeStr.split(',');

            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed.includes('-')) {
                    const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
                    if (start && end && start <= end && start >= 1 && end <= maxPages) {
                        for (let i = start; i <= end; i++) {
                            pages.add(i);
                        }
                    }
                } else {
                    const num = parseInt(trimmed);
                    if (num >= 1 && num <= maxPages) {
                        pages.add(num);
                    }
                }
            }

            return Array.from(pages).sort((a, b) => a - b);
        }
    }
};

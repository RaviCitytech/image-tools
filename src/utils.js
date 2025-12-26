
window.AppUtils = {
    loadImage: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    formatBytes: (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    setupUpload: (dropZoneElement, onFileSelect) => {
        const handleFiles = (files) => {
            if (files && files.length > 0) {
                const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
                if (validFiles.length === 0) {
                    alert('Please upload image files.');
                    return;
                }
                onFileSelect(validFiles);
            }
        };

        dropZoneElement.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true; // Allow multiple
            input.onchange = (e) => handleFiles(e.target.files);
            input.click();
        });

        dropZoneElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneElement.classList.add('active');
        });

        dropZoneElement.addEventListener('dragleave', () => {
            dropZoneElement.classList.remove('active');
        });

        dropZoneElement.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneElement.classList.remove('active');
            handleFiles(e.dataTransfer.files);
        });
    },

    downloadBlob: (blob, filename) => {
        window.saveAs(blob, filename);
    },

    downloadZip: async (files, zipName = 'images.zip') => {
        const zip = new JSZip();
        for (const file of files) {
            zip.file(file.name, file.blob);
        }
        const content = await zip.generateAsync({ type: "blob" });
        window.saveAs(content, zipName);
    }
};

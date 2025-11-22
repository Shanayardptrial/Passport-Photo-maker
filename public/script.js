/**
 * Passport Photo Generator V2
 * Robust Class-based Architecture
 */

class PhotoApp {
    constructor() {
        // --- State ---
        this.state = {
            currentStep: 1,
            originalImage: null,
            croppedImage: null,
            processedImage: null,
            printCount: 30,
            cropper: null
        };

        // --- DOM Elements Cache ---
        this.dom = {
            views: {
                upload: document.getElementById('view-upload'),
                editor: document.getElementById('view-editor'),
                print: document.getElementById('view-print')
            },
            steps: document.querySelectorAll('.step'),

            // Upload
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'),

            // Editor
            editorImage: document.getElementById('editor-image'),
            btnRotate: document.getElementById('btn-rotate'),
            btnReset: document.getElementById('btn-reset'),
            btnProcess: document.getElementById('btn-process'),
            btnCancel: document.getElementById('btn-cancel'),

            // Print
            a4Preview: document.getElementById('a4-preview'),
            countSelector: document.getElementById('count-selector'),
            btnPrint: document.getElementById('btn-print'),
            btnNew: document.getElementById('btn-new'),

            // Overlay
            overlay: document.getElementById('overlay-loading'),
            loadingText: document.getElementById('loading-text')
        };

        this.init();
    }

    init() {
        console.log('PhotoApp V2 Initializing...');
        this.bindEvents();
        this.transitionTo(1); // Start at Step 1
    }

    bindEvents() {
        // --- Upload Events ---
        this.dom.dropZone.addEventListener('click', () => this.dom.fileInput.click());
        this.dom.fileInput.addEventListener('change', (e) => this.handleUpload(e.target.files[0]));

        // Drag & Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dom.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        this.dom.dropZone.addEventListener('dragover', () => this.dom.dropZone.classList.add('is-dragover'));
        this.dom.dropZone.addEventListener('dragleave', () => this.dom.dropZone.classList.remove('is-dragover'));
        this.dom.dropZone.addEventListener('drop', (e) => {
            this.dom.dropZone.classList.remove('is-dragover');
            this.handleUpload(e.dataTransfer.files[0]);
        });

        // --- Editor Events ---
        this.dom.btnRotate.addEventListener('click', () => this.state.cropper?.rotate(90));
        this.dom.btnReset.addEventListener('click', () => this.state.cropper?.reset());
        this.dom.btnCancel.addEventListener('click', () => this.transitionTo(1));
        this.dom.btnProcess.addEventListener('click', () => this.processImage());

        // --- Print Events ---
        this.dom.btnPrint.addEventListener('click', () => window.print());
        this.dom.btnNew.addEventListener('click', () => location.reload());

        this.dom.countSelector.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update UI
                this.dom.countSelector.querySelectorAll('button').forEach(b => b.classList.remove('is-selected'));
                e.target.classList.add('is-selected');

                // Update State
                this.state.printCount = parseInt(e.target.dataset.count);
                this.renderGrid();
            });
        });
    }

    // --- State Management ---
    transitionTo(step) {
        // 1. Update State
        this.state.currentStep = step;

        // 2. Update View Visibility
        Object.values(this.dom.views).forEach(view => view.classList.remove('is-visible'));
        if (step === 1) this.dom.views.upload.classList.add('is-visible');
        if (step === 2) this.dom.views.editor.classList.add('is-visible');
        if (step === 3) this.dom.views.print.classList.add('is-visible');

        // 3. Update Stepper UI
        this.dom.steps.forEach(el => {
            const s = parseInt(el.dataset.step);
            el.classList.toggle('is-active', s === step);
        });

        // 4. Cleanup
        if (step !== 2 && this.state.cropper) {
            this.state.cropper.destroy();
            this.state.cropper = null;
        }
    }

    toggleLoading(show, text = 'Processing...') {
        this.dom.loadingText.textContent = text;
        this.dom.overlay.classList.toggle('is-hidden', !show);
    }

    // --- Logic: Upload ---
    handleUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload a valid image file (JPG, PNG).');
            return;
        }

        this.toggleLoading(true, 'Loading Image...');

        const reader = new FileReader();
        reader.onload = (e) => {
            this.state.originalImage = e.target.result;

            // Important: Wait for image to load in DOM before starting Cropper
            this.dom.editorImage.src = this.state.originalImage;
            this.dom.editorImage.onload = () => {
                this.toggleLoading(false);
                this.transitionTo(2);
                this.initCropper();
            };
        };
        reader.readAsDataURL(file);

        // Reset input to allow re-uploading same file
        this.dom.fileInput.value = '';
    }

    // --- Logic: Editor ---
    initCropper() {
        if (this.state.cropper) this.state.cropper.destroy();

        this.state.cropper = new Cropper(this.dom.editorImage, {
            aspectRatio: 35 / 45, // Standard Passport Ratio
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.8,
            guides: true,
            center: true,
            background: false,
            highlight: false,
            responsive: true,
            restore: false,
        });
    }

    async processImage() {
        if (!this.state.cropper) return;

        this.toggleLoading(true, 'Preparing Image...');

        try {
            // 1. Get Cropped Canvas
            const canvas = this.state.cropper.getCroppedCanvas({
                width: 413, height: 531, // High Res Passport Size
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            // 2. Convert to Blob
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('image', blob, 'photo.png');

                // 3. Send to API
                this.toggleLoading(true, 'Removing Background (AI)...');

                try {
                    const response = await fetch('/api/remove-background', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Server Error');

                    const data = await response.json();

                    if (data.success && data.image) {
                        this.state.processedImage = data.image;
                        this.toggleLoading(false);
                        this.transitionTo(3);
                        this.renderGrid();
                    } else {
                        throw new Error(data.error || 'Unknown Error');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Background removal failed. Please try again.');
                    this.toggleLoading(false);
                }
            }, 'image/png');

        } catch (err) {
            console.error(err);
            alert('Error processing image.');
            this.toggleLoading(false);
        }
    }

    // --- Logic: Print ---
    renderGrid() {
        const container = this.dom.a4Preview;
        container.innerHTML = '';

        for (let i = 0; i < this.state.printCount; i++) {
            const div = document.createElement('div');
            div.className = 'passport-photo';

            const img = document.createElement('img');
            img.src = this.state.processedImage;

            div.appendChild(img);
            container.appendChild(div);
        }
    }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhotoApp();
});

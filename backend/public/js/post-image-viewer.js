(() => {
    const imageSelector = '.post-card > img, .portfolio-work-cover img';

    const viewer = document.createElement('dialog');
    viewer.className = 'image-viewer';
    viewer.setAttribute('aria-label', 'Visualização da imagem da publicação');

    const closeButton = document.createElement('button');
    closeButton.className = 'image-viewer-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Fechar visualização');
    closeButton.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';

    const zoomControls = document.createElement('div');
    zoomControls.className = 'image-viewer-controls';
    zoomControls.setAttribute('role', 'group');
    zoomControls.setAttribute('aria-label', 'Controles de zoom');

    const zoomOutButton = document.createElement('button');
    zoomOutButton.type = 'button';
    zoomOutButton.setAttribute('aria-label', 'Reduzir zoom');
    zoomOutButton.textContent = '−';

    const zoomLevel = document.createElement('span');
    zoomLevel.setAttribute('aria-live', 'polite');

    const zoomInButton = document.createElement('button');
    zoomInButton.type = 'button';
    zoomInButton.setAttribute('aria-label', 'Ampliar zoom');
    zoomInButton.textContent = '+';

    const zoomResetButton = document.createElement('button');
    zoomResetButton.type = 'button';
    zoomResetButton.setAttribute('aria-label', 'Restaurar tamanho original');
    zoomResetButton.textContent = 'Redefinir';
    zoomControls.append(zoomOutButton, zoomLevel, zoomInButton, zoomResetButton);

    const viewerImage = document.createElement('img');
    viewerImage.draggable = false;
    viewer.append(closeButton, zoomControls, viewerImage);
    document.body.appendChild(viewer);

    const minZoom = 1;
    const maxZoom = 4;
    const zoomStep = 0.25;
    let zoom = minZoom;
    let panX = 0;
    let panY = 0;
    let dragStart = null;

    function updateZoom() {
        viewerImage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        viewerImage.style.cursor = zoom > minZoom ? 'grab' : 'zoom-in';
        zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
        zoomOutButton.disabled = zoom <= minZoom;
        zoomInButton.disabled = zoom >= maxZoom;
    }

    function setZoom(value) {
        zoom = Math.min(maxZoom, Math.max(minZoom, value));
        if (zoom === minZoom) {
            panX = 0;
            panY = 0;
        }
        updateZoom();
    }

    function findPostImage(target) {
        if (!(target instanceof Element)) return null;
        const image = target.closest('img');
        return image?.matches(imageSelector) ? image : null;
    }

    function enhancePostImages(root) {
        if (root instanceof HTMLImageElement && root.matches(imageSelector)) {
            root.tabIndex = 0;
            root.setAttribute('role', 'button');
            root.setAttribute('aria-label', `Ampliar imagem: ${root.alt || 'Imagem da publicação'}`);
            root.title = 'Clique para ampliar';
        }

        if (root instanceof Document || root instanceof Element) {
            root.querySelectorAll(imageSelector).forEach(enhancePostImages);
        }
    }

    enhancePostImages(document);
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(enhancePostImages);
        });
    }).observe(document.body, { childList: true, subtree: true });

    function openViewer(image) {
        panX = 0;
        panY = 0;
        zoom = minZoom;
        viewerImage.src = image.src;
        viewerImage.alt = image.alt;
        updateZoom();
        viewer.showModal();
    }

    document.addEventListener('click', (event) => {
        const image = findPostImage(event.target);
        if (image) openViewer(image);
    });

    document.addEventListener('keydown', (event) => {
        const image = findPostImage(event.target);
        if (image && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openViewer(image);
            return;
        }

        if (!viewer.open) return;
        if (event.key === '+' || event.key === '=') setZoom(zoom + zoomStep);
        if (event.key === '-') setZoom(zoom - zoomStep);
        if (event.key === '0') setZoom(minZoom);
    });

    zoomInButton.addEventListener('click', () => setZoom(zoom + zoomStep));
    zoomOutButton.addEventListener('click', () => setZoom(zoom - zoomStep));
    zoomResetButton.addEventListener('click', () => setZoom(minZoom));
    viewer.addEventListener('wheel', (event) => {
        event.preventDefault();
        setZoom(zoom + (event.deltaY < 0 ? zoomStep : -zoomStep));
    }, { passive: false });

    viewerImage.addEventListener('pointerdown', (event) => {
        if (zoom <= minZoom) return;
        dragStart = { x: event.clientX - panX, y: event.clientY - panY };
        viewerImage.setPointerCapture(event.pointerId);
        viewerImage.style.cursor = 'grabbing';
    });
    viewerImage.addEventListener('pointermove', (event) => {
        if (!dragStart) return;
        panX = event.clientX - dragStart.x;
        panY = event.clientY - dragStart.y;
        updateZoom();
        viewerImage.style.cursor = 'grabbing';
    });
    function stopDragging() {
        dragStart = null;
        if (viewerImage.isConnected) updateZoom();
    }
    viewerImage.addEventListener('pointerup', stopDragging);
    viewerImage.addEventListener('pointercancel', stopDragging);

    closeButton.addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', (event) => {
        if (event.target === viewer) viewer.close();
    });
    viewer.addEventListener('close', () => {
        dragStart = null;
        setZoom(minZoom);
        viewerImage.removeAttribute('src');
        viewerImage.alt = '';
    });
})();

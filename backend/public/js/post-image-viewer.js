(() => {
    const imageSelector = '.post-card > img';

    const viewer = document.createElement('dialog');
    viewer.className = 'image-viewer';
    viewer.setAttribute('aria-label', 'Visualização da imagem da publicação');

    const closeButton = document.createElement('button');
    closeButton.className = 'image-viewer-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Fechar visualização');
    closeButton.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';

    const viewerImage = document.createElement('img');
    viewer.append(closeButton, viewerImage);
    document.body.appendChild(viewer);

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
        viewerImage.src = image.src;
        viewerImage.alt = image.alt;
        viewer.showModal();
    }

    document.addEventListener('click', (event) => {
        const image = findPostImage(event.target);
        if (image) openViewer(image);
    });

    document.addEventListener('keydown', (event) => {
        const image = findPostImage(event.target);
        if (!image || (event.key !== 'Enter' && event.key !== ' ')) return;

        event.preventDefault();
        openViewer(image);
    });

    closeButton.addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', (event) => {
        if (event.target === viewer) viewer.close();
    });
    viewer.addEventListener('close', () => {
        viewerImage.removeAttribute('src');
        viewerImage.alt = '';
    });
})();

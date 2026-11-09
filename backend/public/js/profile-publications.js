(() => {
    function formatTime(value) {
        if (!value) return 'Recentemente';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Recentemente';

        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Agora';
        if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)} horas`;
        return date.toLocaleDateString('pt-BR');
    }

    function createPost(postData) {
        const article = document.createElement('article');
        article.className = 'post-card profile-post';
        article.dataset.postId = postData.id;

        const header = document.createElement('div');
        header.className = 'post-header';
        const user = document.createElement('div');
        user.className = 'post-user';
        const avatar = document.createElement('div');
        avatar.className = 'avatar small';
        avatar.style.overflow = 'hidden';
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';

        if (postData.avatar) {
            const image = document.createElement('img');
            image.src = postData.avatar;
            image.alt = `Foto de ${postData.autor}`;
            avatar.appendChild(image);
        } else {
            avatar.textContent = (postData.autor || 'U').charAt(0).toUpperCase();
        }

        const identity = document.createElement('div');
        const author = document.createElement('strong');
        author.textContent = postData.autor || 'Usuário';
        const time = document.createElement('p');
        time.textContent = formatTime(postData.criado_em);
        identity.append(author, time);
        user.append(avatar, identity);

        const category = document.createElement('span');
        category.className = 'tag';
        category.textContent = postData.category || 'Portfólio';
        header.append(user, category);
        article.appendChild(header);

        if (postData.caption) {
            const caption = document.createElement('p');
            caption.className = 'public-post-caption';
            caption.textContent = postData.caption;
            article.appendChild(caption);
        }

        if (postData.image) {
            const image = document.createElement('img');
            image.src = postData.image;
            image.alt = `Publicação de ${postData.autor || 'Usuário'}`;
            article.appendChild(image);
        }

        return article;
    }

    async function loadProfilePublications(userId) {
        const container = document.querySelector('#profile-publications');
        if (!container) return;
        if (!userId) {
            container.innerHTML = '<p class="profile-publications-message">Não foi possível identificar este perfil.</p>';
            return;
        }

        container.innerHTML = '<p class="profile-publications-message">Carregando publicações...</p>';
        try {
            const response = await fetch(`/api/publicacoes/usuario/${encodeURIComponent(userId)}`);
            const result = await response.json();
            if (!response.ok || !result.sucesso || !Array.isArray(result.dados)) {
                throw new Error(result.mensagem || 'Não foi possível carregar as publicações.');
            }

            if (result.dados.length === 0) {
                container.innerHTML = '<p class="profile-publications-message">Este perfil ainda não tem publicações.</p>';
                return;
            }

            container.replaceChildren(...result.dados.map(createPost));
            const requestedPostId = new URLSearchParams(window.location.search).get('publicacao');
            if (requestedPostId) {
                const requestedPost = [...container.children].find(post => post.dataset.postId === requestedPostId);
                if (requestedPost) {
                    requestedPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    requestedPost.classList.add('is-highlighted');
                    window.setTimeout(() => requestedPost.classList.remove('is-highlighted'), 2500);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar publicações do perfil:', error);
            container.innerHTML = '<p class="profile-publications-message">Não foi possível carregar as publicações. Tente novamente.</p>';
        }
    }

    window.loadProfilePublications = loadProfilePublications;
})();

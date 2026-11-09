(() => {
    const feed = document.querySelector('.social-feed');
    if (!feed) return;

    function readStoredJson(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        } catch (error) {
            console.error(`Não foi possível ler ${key} da sessão:`, error);
            return fallback;
        }
    }

    const userData = readStoredJson('pallasUser', {});
    const currentUserId = String(userData.usuario_id || userData.perfil?.usuario_id?._id
        || userData.perfil?.usuario_id || userData.perfil?._id || userData._id || '');
    const profileKey = currentUserId ? `pallasProfile_${currentUserId}` : 'pallasProfile';
    const cachedProfile = readStoredJson(profileKey, null) || userData.perfil || {};
    const accountProfile = userData.perfil && typeof userData.perfil === 'object' ? userData.perfil : userData;
    const currentUserAvatar = cachedProfile.avatar || accountProfile.avatar || userData.avatar || '';

    // Formata o tempo decorrido relativo (ex: 'Há 5 minutos', 'Há 2 horas', 'Hoje')
    function formatTime(isoString) {
        if (!isoString) return 'Recentemente';
        const date = new Date(isoString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'Agora';
        if (diffSeconds < 3600) return `Há ${Math.floor(diffSeconds / 60)} min`;
        if (diffSeconds < 86400) return `Há ${Math.floor(diffSeconds / 3600)} horas`;
        return date.toLocaleDateString('pt-BR');
    }

    function createPostElement(postData) {
        const authorAvatar = currentUserId && String(postData.usuario_id) === currentUserId
            ? currentUserAvatar || postData.avatar
            : postData.avatar;
        const post = document.createElement('article');
        post.className = 'post-card';
        post.dataset.postId = postData.id;

        const header = document.createElement('div');
        header.className = 'post-header';

        const user = document.createElement('div');
        user.className = 'post-user';

        // 1. Foto de perfil vinculada ao autor deste post específico
        const avatarLink = document.createElement('a');
        avatarLink.href = `perfil-publico.html?id=${encodeURIComponent(postData.usuario_id || '')}`;
        avatarLink.className = 'avatar small';
        avatarLink.style.overflow = 'hidden';
        avatarLink.style.display = 'flex';
        avatarLink.style.alignItems = 'center';
        avatarLink.style.justifyContent = 'center';
        avatarLink.style.textDecoration = 'none';

        if (authorAvatar) {
            const img = document.createElement('img');
            img.src = authorAvatar;
            img.alt = `Foto de ${postData.autor || 'Usuário'}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            avatarLink.replaceChildren(img);
        } else {
            avatarLink.textContent = postData.initial || postData.autor?.charAt(0).toUpperCase() || 'U';
        }

        const identity = document.createElement('div');
        const authorLink = document.createElement('a');
        authorLink.href = `perfil-publico.html?id=${encodeURIComponent(postData.usuario_id || '')}`;
        authorLink.style.textDecoration = 'none';
        authorLink.style.color = 'inherit';
        const author = document.createElement('strong');
        author.textContent = postData.autor || 'Usuário';
        authorLink.appendChild(author);

        const time = document.createElement('p');
        time.textContent = formatTime(postData.criado_em);
        identity.append(authorLink, time);

        user.append(avatarLink, identity);

        const category = document.createElement('span');
        category.className = 'tag';
        category.textContent = postData.category || 'Portfólio';

        header.append(user, category);

        // Se for o autor do post, adiciona botão de excluir
        const isAuthor = currentUserId && String(postData.usuario_id) === currentUserId;
        if (isAuthor) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'post-delete-button';
            deleteButton.type = 'button';
            deleteButton.setAttribute('aria-label', 'Excluir publicação');
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', async () => {
                if (!window.confirm('Tem certeza de que deseja excluir esta publicação?')) return;
                try {
                    await fetch(`/api/publicacoes/${postData.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuario_id: currentUserId })
                    });
                    // Remove também do fallback local se existir
                    const localPosts = readStoredJson('pallasPosts', []);
                    localStorage.setItem('pallasPosts', JSON.stringify(localPosts.filter(p => p.id !== postData.id)));
                    post.remove();
                } catch {
                    post.remove();
                }
            });
            header.append(deleteButton);
        }

        post.append(header);

        if (postData.caption) {
            const caption = document.createElement('p');
            caption.textContent = postData.caption;
            post.append(caption);
        }

        if (postData.image) {
            const image = document.createElement('img');
            image.src = postData.image;
            image.alt = `Publicação de ${postData.autor || 'Usuário'}`;
            post.append(image);
        }

        // Engajamento (Curtidas e Comentários)
        const storageKey = `pallasPost_${postData.id}`;
        const savedEngage = readStoredJson(storageKey, { liked: false, likes: 0, comments: [] });
        if (typeof postData.curtidasCount === 'number') savedEngage.likes = postData.curtidasCount;
        if (typeof postData.likedByMe === 'boolean') savedEngage.liked = postData.likedByMe;
        if (Array.isArray(postData.comments)) savedEngage.comments = postData.comments;
        const postExistsInDatabase = /^[0-9a-fA-F]{24}$/.test(String(postData.id || ''));

        const engagement = document.createElement('div');
        engagement.className = 'post-engagement';

        const likeButton = document.createElement('button');
        likeButton.className = 'post-action like-button';
        likeButton.type = 'button';
        likeButton.setAttribute('aria-label', 'Curtir publicação');
        likeButton.classList.toggle('is-liked', savedEngage.liked);
        likeButton.innerHTML = `<i class="bi ${savedEngage.liked ? 'bi-heart-fill' : 'bi-heart'}"></i> Curtir <span class="like-count">${savedEngage.likes}</span>`;

        const commentsMetric = document.createElement('span');
        commentsMetric.className = 'post-metric';
        commentsMetric.innerHTML = `<i class="bi bi-chat"></i> <span class="comment-count">${savedEngage.comments.length}</span> comentários`;

        engagement.append(likeButton, commentsMetric);
        post.append(engagement);

        // Lista de comentários
        const comments = document.createElement('ul');
        comments.className = 'comments-list';
        comments.setAttribute('aria-live', 'polite');
        post.append(comments);

        const commentForm = document.createElement('form');
        commentForm.className = 'comment-form';
        commentForm.innerHTML = `
            <input type="text" placeholder="Escreva um comentário..." aria-label="Comentário" maxlength="160">
            <button class="post-action" type="submit" aria-label="Enviar comentário"><i class="bi bi-send"></i></button>
        `;
        post.append(commentForm);

        function renderComments() {
            comments.replaceChildren(...savedEngage.comments.map((comment, index) => {
                const item = document.createElement('li');
                const cAuthor = document.createElement('strong');
                cAuthor.textContent = comment.author || 'Comentário';
                const text = document.createElement('span');
                text.textContent = ` ${comment.text || comment}`;
                item.append(cAuthor, text);
                return item;
            }));
            post.querySelector('.comment-count').textContent = savedEngage.comments.length;
            localStorage.setItem(storageKey, JSON.stringify(savedEngage));
        }
        renderComments();

        likeButton.addEventListener('click', async () => {
            if (postExistsInDatabase && currentUserId) {
                likeButton.disabled = true;
                try {
                    const response = await fetch(`/api/publicacoes/${postData.id}/curtir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuario_id: currentUserId })
                    });
                    const result = await response.json();
                    if (!response.ok || !result.sucesso) {
                        throw new Error(result.mensagem || 'Não foi possível registrar a curtida.');
                    }

                    savedEngage.liked = result.dados.curtido;
                    savedEngage.likes = result.dados.curtidasCount;
                    likeButton.classList.toggle('is-liked', savedEngage.liked);
                    likeButton.innerHTML = `<i class="bi ${savedEngage.liked ? 'bi-heart-fill' : 'bi-heart'}"></i> Curtir <span class="like-count">${savedEngage.likes}</span>`;
                    localStorage.setItem(storageKey, JSON.stringify(savedEngage));
                } catch (error) {
                    console.error('Erro ao registrar curtida:', error);
                    window.alert(error.message);
                } finally {
                    likeButton.disabled = false;
                }
                return;
            }

            savedEngage.liked = !savedEngage.liked;
            savedEngage.likes = Math.max(0, savedEngage.likes + (savedEngage.liked ? 1 : -1));
            likeButton.classList.toggle('is-liked', savedEngage.liked);
            likeButton.innerHTML = `<i class="bi ${savedEngage.liked ? 'bi-heart-fill' : 'bi-heart'}"></i> Curtir <span class="like-count">${savedEngage.likes}</span>`;
            localStorage.setItem(storageKey, JSON.stringify(savedEngage));
        });

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = commentForm.querySelector('input');
            const val = input.value.trim();
            if (!val) return;

            if (postExistsInDatabase && currentUserId) {
                const submitButton = commentForm.querySelector('button');
                submitButton.disabled = true;
                try {
                    const response = await fetch(`/api/publicacoes/${postData.id}/comentarios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuario_id: currentUserId, texto: val })
                    });
                    const result = await response.json();
                    if (!response.ok || !result.sucesso || !result.dados) {
                        throw new Error(result.mensagem || 'Não foi possível enviar o comentário.');
                    }
                    savedEngage.comments.push(result.dados);
                    input.value = '';
                    renderComments();
                } catch (error) {
                    console.error('Erro ao enviar comentário:', error);
                    window.alert(error.message);
                } finally {
                    submitButton.disabled = false;
                }
                return;
            }

            const account = userData.perfil && typeof userData.perfil === 'object' ? userData.perfil : userData;
            const myName = account.nome_artistico || account.nome || account.nome_fantasia || userData.login || 'Você';
            savedEngage.comments.push({ author: myName, text: val });
            input.value = '';
            renderComments();
        });

        return post;
    }

    async function loadFeed() {
        try {
            const query = currentUserId ? `?usuario_id=${encodeURIComponent(currentUserId)}` : '';
            const res = await fetch(`/api/publicacoes/feed${query}`);
            const json = await res.json();

            if (res.ok && json.sucesso && json.dados && json.dados.length > 0) {
                // Remove posts estáticos de exemplo
                feed.querySelectorAll('.post-card').forEach(p => p.remove());

                json.dados.forEach((postData) => {
                    const postEl = createPostElement(postData);
                    feed.appendChild(postEl);
                });
                return;
            }
        } catch (e) {
            console.warn('Erro ao carregar feed da API, usando dados locais se houver:', e);
        }

        // Fallback local se não houver posts no MongoDB ainda
        const localPosts = JSON.parse(localStorage.getItem('pallasPosts') || '[]');
        if (localPosts.length > 0) {
            feed.querySelectorAll('.post-card').forEach(p => p.remove());
            localPosts.forEach((lp) => {
                const postEl = createPostElement({
                    id: lp.id,
                    usuario_id: lp.usuario_id || currentUserId,
                    autor: lp.author || 'Usuário',
                    avatar: lp.avatar || '',
                    initial: lp.initial || 'U',
                    caption: lp.caption,
                    category: lp.category,
                    image: lp.image,
                    criado_em: lp.createdAt
                });
                feed.appendChild(postEl);
            });
        }
    }

    loadFeed();
})();

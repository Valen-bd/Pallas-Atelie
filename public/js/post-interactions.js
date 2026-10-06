(() => {
    const feed = document.querySelector('.social-feed');
    const savedPosts = JSON.parse(localStorage.getItem('pallasPosts') || '[]');

    if (feed) {
        savedPosts.forEach((savedPost) => {
            const post = document.createElement('article');
            post.className = 'post-card';
            post.dataset.postId = savedPost.id;

            const header = document.createElement('div');
            header.className = 'post-header';
            const user = document.createElement('div');
            user.className = 'post-user';
            const avatar = document.createElement('div');
            avatar.className = 'avatar small';
            avatar.textContent = savedPost.initial || 'U';
            const identity = document.createElement('div');
            const author = document.createElement('strong');
            author.textContent = savedPost.author || 'Usuário';
            const time = document.createElement('p');
            time.textContent = 'Agora';
            identity.append(author, time);
            user.append(avatar, identity);
            const category = document.createElement('span');
            category.className = 'tag';
            category.textContent = savedPost.category || 'Portfólio';
            const deleteButton = document.createElement('button');
            deleteButton.className = 'post-delete-button';
            deleteButton.type = 'button';
            deleteButton.setAttribute('aria-label', 'Excluir publicação');
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => {
                if (!window.confirm('Tem certeza de que deseja excluir esta publicação?')) return;

                try {
                    const currentPosts = JSON.parse(localStorage.getItem('pallasPosts') || '[]');
                    localStorage.setItem('pallasPosts', JSON.stringify(
                        currentPosts.filter((postItem) => postItem.id !== savedPost.id)
                    ));
                    localStorage.removeItem(`pallasPost_${savedPost.id}`);
                    post.remove();
                } catch {
                    window.alert('Não foi possível excluir a publicação. Tente novamente.');
                }
            });
            header.append(user, category, deleteButton);
            post.append(header);

            const caption = document.createElement('p');
            caption.textContent = savedPost.caption;
            post.append(caption);
            if (savedPost.image) {
                const image = document.createElement('img');
                image.src = savedPost.image;
                image.alt = `Imagem da publicação de ${savedPost.author || 'Usuário'}`;
                post.append(image);
            }

            const engagement = document.createElement('div');
            engagement.className = 'post-engagement';
            const likeButton = document.createElement('button');
            likeButton.className = 'post-action like-button';
            likeButton.type = 'button';
            likeButton.setAttribute('aria-label', 'Curtir publicação');
            likeButton.setAttribute('aria-pressed', 'false');
            const heart = document.createElement('i');
            heart.className = 'bi bi-heart';
            heart.setAttribute('aria-hidden', 'true');
            likeButton.append(heart, document.createTextNode(' Curtir '));
            const likeCount = document.createElement('span');
            likeCount.className = 'like-count';
            likeButton.append(likeCount);
            const commentsMetric = document.createElement('span');
            commentsMetric.className = 'post-metric';
            const commentIcon = document.createElement('i');
            commentIcon.className = 'bi bi-chat';
            commentIcon.setAttribute('aria-hidden', 'true');
            const commentCount = document.createElement('span');
            commentCount.className = 'comment-count';
            commentsMetric.append(commentIcon, document.createTextNode(' '), commentCount, document.createTextNode(' comentários'));
            engagement.append(likeButton, commentsMetric);
            post.append(engagement);

            const comments = document.createElement('ul');
            comments.className = 'comments-list';
            comments.setAttribute('aria-live', 'polite');
            post.append(comments);
            const commentForm = document.createElement('form');
            commentForm.className = 'comment-form';
            const commentInput = document.createElement('input');
            commentInput.type = 'text';
            commentInput.placeholder = 'Escreva um comentário...';
            commentInput.setAttribute('aria-label', 'Comentário');
            commentInput.maxLength = 160;
            const commentButton = document.createElement('button');
            commentButton.className = 'post-action';
            commentButton.type = 'submit';
            commentButton.setAttribute('aria-label', 'Enviar comentário');
            const sendIcon = document.createElement('i');
            sendIcon.className = 'bi bi-send';
            sendIcon.setAttribute('aria-hidden', 'true');
            commentButton.append(sendIcon);
            commentForm.append(commentInput, commentButton);
            post.append(commentForm);
            feed.insertBefore(post, feed.querySelector('.post-card'));
        });
    }

    document.querySelectorAll('.post-card[data-post-id]').forEach((post) => {
        const postId = post.dataset.postId;
        const storageKey = `pallasPost_${postId}`;
        const savedData = JSON.parse(localStorage.getItem(storageKey) || '{"liked":false,"likes":0,"comments":[]}');
        const likeButton = post.querySelector('.like-button');
        const likeCount = post.querySelector('.like-count');
        const commentCount = post.querySelector('.comment-count');
        const comments = post.querySelector('.comments-list');
        const commentForm = post.querySelector('.comment-form');

        const updatePost = () => {
            likeButton.classList.toggle('is-liked', savedData.liked);
            likeButton.setAttribute('aria-pressed', savedData.liked);
            likeCount.textContent = savedData.likes;
            commentCount.textContent = savedData.comments.length;
            comments.replaceChildren(...savedData.comments.map((comment) => {
                const item = document.createElement('li');
                const author = document.createElement('strong');
                const text = document.createElement('span');
                author.textContent = 'Você';
                text.textContent = comment;
                item.append(author, text);
                return item;
            }));
            localStorage.setItem(storageKey, JSON.stringify(savedData));
        };

        likeButton.addEventListener('click', () => {
            savedData.liked = !savedData.liked;
            savedData.likes = Math.max(0, savedData.likes + (savedData.liked ? 1 : -1));
            updatePost();
        });

        commentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = commentForm.querySelector('input');
            const comment = input.value.trim();
            if (!comment) return;
            savedData.comments.push(comment);
            input.value = '';
            updatePost();
        });

        updatePost();
    });
})();

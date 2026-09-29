(() => {
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

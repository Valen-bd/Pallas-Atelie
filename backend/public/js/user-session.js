/**
 * Gerenciador de Sessão e Atualização Visual do Pallas Ateliê:
 * Aplica as fotos de perfil, banners e nomes do usuário autenticado
 * em todas as páginas do sistema.
 */
(function () {
    function readStoredJson(key) {
        const val = localStorage.getItem(key);
        if (!val) return null;
        try {
            return JSON.parse(val);
        } catch (e) {
            return null;
        }
    }

    function applyUserVisuals() {
        const user = readStoredJson('pallasUser') || {};
        const account = user.perfil && typeof user.perfil === 'object' ? user.perfil : user;
        const profile = readStoredJson('pallasProfile') || {};

        // Busca o avatar com máxima prioridade: salvo nas alterações do perfil -> salvo no banco de dados
        const avatarSrc = profile.avatar || account.avatar || user.avatar || '';
        const coverSrc = profile.cover || account.cover || user.cover || '';

        const displayName = profile.nome
            || account.nome_artistico
            || account.nome_fantasia
            || account.nome
            || user.nome_artistico
            || user.nome_fantasia
            || user.nome
            || user.login
            || 'Usuário';

        const initial = displayName.charAt(0).toUpperCase() || 'U';
        const rawLogin = profile.usuario || user.login || account.login || 'usuario';
        const displayUsername = rawLogin.startsWith('@') ? rawLogin : `@${rawLogin}`;
        const displayBio = profile.bio || account.bio || user.bio || '';
        const rawArte = profile.arte || account.tipo_arte || user.tipo_arte || '';
        const displayArte = Array.isArray(rawArte) ? rawArte.join(', ') : rawArte;

        setupNotificationIcon(user);

        // Atualizar Nome no Header e Perfil Mini
        document.querySelectorAll('.social-header .profile-mini span, #header-name').forEach((el) => {
            el.textContent = displayName;
        });

        // Atualizar todas as instâncias de avatar do usuário logado
        const avatarSelectors = [
            '.social-header .profile-mini .avatar',
            '#header-avatar',
            '#post-avatar',
            '#profile-avatar-preview',
            '.social-profile .avatar',
            '.perfil-social .perfil-avatar',
            '.notificacoes-card .perfil-avatar',
            '.perfil-social .profile-post .avatar',
            '.edit-profile-container .avatar'
        ].join(', ');

        const portfolioAvatar = document.querySelector('#portfolio-avatar');
        const isPublicPortfolio = window.location.pathname.endsWith('/meuportifolio.html')
            && new URLSearchParams(window.location.search).has('id');
        const avatarElements = document.querySelectorAll(avatarSelectors);
        avatarElements.forEach((avatarEl) => {
            if (avatarSrc) {
                avatarEl.textContent = '';
                const img = document.createElement('img');
                img.src = avatarSrc;
                img.alt = displayName;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%';
                avatarEl.replaceChildren(img);
                avatarEl.classList.add('has-image');
            } else {
                avatarEl.textContent = initial;
                avatarEl.classList.remove('has-image');
            }
        });
        if (portfolioAvatar && !isPublicPortfolio && avatarSrc) {
            portfolioAvatar.textContent = '';
            const img = document.createElement('img');
            img.src = avatarSrc;
            img.alt = displayName;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            portfolioAvatar.replaceChildren(img);
            portfolioAvatar.classList.add('has-image');
        }

        // Atualizar Banner/Cover
        if (coverSrc) {
            document.querySelectorAll('body:not(.public-profile-page) .perfil-cover, #profile-cover-preview').forEach((coverEl) => {
                coverEl.style.backgroundImage = `url("${coverSrc}")`;
                coverEl.classList.add('has-image');
            });
        }

        // Sidebar da página inicial
        const sidebarName = document.querySelector('.social-profile h3');
        if (sidebarName) sidebarName.textContent = displayName;
        const sidebarHandle = document.querySelector('.social-profile > div p, .social-profile p');
        if (sidebarHandle) sidebarHandle.textContent = displayUsername;
        const sidebarBio = document.querySelector('.social-profile .profile-bio');
        if (sidebarBio && displayBio) sidebarBio.textContent = displayBio;

        // Página de Perfil
        const perfilTitle = document.querySelector('.perfil-social .perfil-identidade h1');
        if (perfilTitle) perfilTitle.textContent = displayName;
        const perfilSubtitle = document.querySelector('.perfil-social .perfil-identidade p');
        if (perfilSubtitle) perfilSubtitle.textContent = `${displayUsername} • ${displayArte || 'Artes Visuais'}`;
        const perfilBio = document.querySelector('.perfil-social .perfil-bio-box p');
        if (perfilBio && displayBio) perfilBio.textContent = displayBio;

        // Atualizar post do autor em novopost
        const postAuthor = document.querySelector('#post-author-name');
        if (postAuthor) postAuthor.textContent = displayName;
    }

    function setupNotificationIcon(user) {
        const notificationLink = document.querySelector('.social-actions a.icon-badge[href="notificacoes.html"]');
        if (!notificationLink) return;

        notificationLink.classList.add('notification-icon');
        notificationLink.querySelector('.notification-profile-photo')?.remove();
        if (!notificationLink.querySelector('.bi-bell')) {
            const icon = document.createElement('i');
            icon.className = 'bi bi-bell';
            icon.setAttribute('aria-hidden', 'true');
            notificationLink.insertBefore(icon, notificationLink.querySelector('.notification-indicator'));
        }

        const isNotificationsPage = window.location.pathname.endsWith('/notificacoes.html');
        if (isNotificationsPage) {
            notificationLink.querySelector('.notification-indicator')?.remove();
            notificationLink.setAttribute('aria-label', 'Notificações');
        }

        const userId = user.usuario_id?._id || user.usuario_id
            || user.perfil?.usuario_id?._id || user.perfil?.usuario_id
            || user.perfil?._id || user._id || '';
        if (!userId || isNotificationsPage) return;

        const refreshNotificationIndicator = async () => {
            try {
                const response = await fetch(`/api/notificacoes/${encodeURIComponent(userId)}/nao-lidas`);
                const result = await response.json();
                if (!response.ok || !result.sucesso || !Number.isInteger(result.nao_lidas)) {
                    throw new Error(result.mensagem || 'Não foi possível verificar as notificações.');
                }

                let indicator = notificationLink.querySelector('.notification-indicator');
                if (result.nao_lidas > 0) {
                    if (!indicator) {
                        indicator = document.createElement('span');
                        indicator.className = 'notification-indicator';
                        indicator.setAttribute('aria-hidden', 'true');
                        notificationLink.appendChild(indicator);
                    }
                    notificationLink.setAttribute('aria-label', `${result.nao_lidas} notificações não lidas`);
                } else {
                    indicator?.remove();
                    notificationLink.setAttribute('aria-label', 'Notificações');
                }
            } catch (error) {
                console.error('Erro ao verificar notificações:', error);
            }
        };

        refreshNotificationIndicator();
        if (!notificationLink.dataset.notificationStatusReady) {
            notificationLink.dataset.notificationStatusReady = 'true';
            window.setInterval(refreshNotificationIndicator, 15000);
            window.addEventListener('focus', refreshNotificationIndicator);
        }
    }

    function setupUserSearch() {
        document.querySelectorAll('.social-search input').forEach((input) => {
            if (input.id === 'profile-search' || input.dataset.userSearchReady) return;
            input.dataset.userSearchReady = 'true';
            input.setAttribute('aria-label', 'Pesquisar nomes de usuários');
            input.placeholder = 'Pesquisar usuários...';

            const search = () => {
                const term = input.value.trim();
                if (term) {
                    window.location.href = `outros.html?q=${encodeURIComponent(term)}`;
                }
            };

            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    search();
                }
            });

            const searchIcon = input.closest('.social-search')?.querySelector('i');
            if (searchIcon) {
                searchIcon.style.cursor = 'pointer';
                searchIcon.setAttribute('role', 'button');
                searchIcon.setAttribute('tabindex', '0');
                searchIcon.setAttribute('aria-label', 'Pesquisar usuários');
                searchIcon.addEventListener('click', search);
                searchIcon.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        search();
                    }
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyUserVisuals();
            setupUserSearch();
        });
    } else {
        applyUserVisuals();
        setupUserSearch();
    }
    // Executa também após o carregamento completo para sobrepor quaisquer scripts inline
    window.addEventListener('load', applyUserVisuals);
})();

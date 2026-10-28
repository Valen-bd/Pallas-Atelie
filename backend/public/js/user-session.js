(function () {
    function readStoredJson(key) {
        const value = localStorage.getItem(key);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch (error) {
            console.error(`Não foi possível ler os dados salvos em ${key}:`, error);
            return null;
        }
    }

    function nonPlaceholder(value, placeholder) {
        return typeof value === 'string' && value.trim() && value.trim() !== placeholder
            ? value.trim()
            : '';
    }

    const user = readStoredJson('pallasUser') || {};
    const account = user.perfil && typeof user.perfil === 'object' ? user.perfil : user;
    const address = account.endereco || {};
    const storedProfile = readStoredJson('pallasProfile') || {};
    const displayName = account.nome_artistico
        || account.nome_fantasia
        || user.nome_artistico
        || user.nome_fantasia
        || account.nome
        || user.nome
        || user.login
        || 'Usuário';
    const artTypes = account.tipo_arte || account.area || user.tipo_arte || user.area || '';
    const normalizedArtTypes = Array.isArray(artTypes) ? artTypes.join(', ') : artTypes;
    const hasUser = Object.keys(user).length > 0;
    const profile = {
        nome: nonPlaceholder(storedProfile.nome, 'Usuário') || displayName,
        usuario: nonPlaceholder(storedProfile.usuario, '@usuario').replace(/^@/, '') || user.login || account.login || 'usuario',
        bio: storedProfile.bio || '',
        pais: nonPlaceholder(storedProfile.pais, '') || address.pais || '',
        estado: nonPlaceholder(storedProfile.estado, 'São Paulo') || address.uf || '',
        cidade: nonPlaceholder(storedProfile.cidade, 'São Paulo') || address.cidade || '',
        email: nonPlaceholder(storedProfile.email, 'usuario@email.com') || account.email || user.email || '',
        numero: nonPlaceholder(storedProfile.numero, '(00) 00000-0000') || account.fone || '',
        arte: nonPlaceholder(storedProfile.arte, 'Desenho digital') || normalizedArtTypes || (user.tipo_perfil === 'empresa' ? 'Empresa' : 'Artista'),
        avatar: storedProfile.avatar || '',
        cover: storedProfile.cover || ''
    };

    if (hasUser) {
        localStorage.setItem('pallasProfile', JSON.stringify(profile));
    }

    window.PallasUser = user;
    window.PallasProfile = profile;

    document.addEventListener('DOMContentLoaded', function () {
        const name = profile.nome || displayName;
        const initial = name.charAt(0).toUpperCase() || 'U';
        const username = `@${profile.usuario || 'usuario'}`;

        document.querySelectorAll('.social-header .profile-mini span, #header-name').forEach((element) => {
            element.textContent = name;
        });
        document.querySelectorAll('.social-header .profile-mini .avatar, #header-avatar, #portfolio-avatar, #post-avatar, #profile-avatar-preview, .social-profile .avatar, .perfil-social .perfil-avatar, .perfil-social .profile-post .avatar').forEach((avatar) => {
            avatar.textContent = initial;
            if (profile.avatar) {
                const image = document.createElement('img');
                image.src = profile.avatar;
                image.alt = `Foto de perfil de ${name}`;
                avatar.replaceChildren(image);
                avatar.classList.add('has-image');
            }
        });

        const sidebarName = document.querySelector('.social-profile h3');
        if (sidebarName) sidebarName.textContent = name;
        const sidebarHandle = document.querySelector('.social-profile > div p');
        if (sidebarHandle) sidebarHandle.textContent = username;

        const profileIdentity = document.querySelector('.perfil-social .perfil-identidade');
        if (profileIdentity) {
            const heading = profileIdentity.querySelector('h1');
            const subtitle = profileIdentity.querySelector('p');
            if (heading) heading.textContent = name;
            if (subtitle) subtitle.textContent = `${username} • ${profile.arte}`;
        }

        const bio = document.querySelector('.perfil-social .perfil-bio-box p');
        if (bio && profile.bio) bio.textContent = profile.bio;

        if (profile.cover) {
            const cover = document.querySelector('.perfil-social .perfil-cover');
            if (cover) cover.style.backgroundImage = `url("${profile.cover}")`;
        }

        const profileValues = [profile.pais, profile.estado, profile.cidade, profile.email, profile.numero, profile.arte];
        document.querySelectorAll('.perfil-social .perfil-lista p').forEach((item, index) => {
            const value = profileValues[index];
            if (value) item.lastChild.textContent = ` ${value}`;
        });

        const portfolioName = document.querySelector('#portfolio-name');
        if (portfolioName) portfolioName.textContent = name;
        const portfolioUsername = document.querySelector('#portfolio-username');
        if (portfolioUsername) portfolioUsername.textContent = username;
        const portfolioArtType = document.querySelector('#portfolio-art-type');
        if (portfolioArtType) portfolioArtType.textContent = profile.arte;

        const postAuthor = document.querySelector('#post-author-name');
        if (postAuthor) postAuthor.textContent = name;
    });
})();

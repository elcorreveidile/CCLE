(function () {
    // Remove no-js class as soon as script loads
    document.documentElement.classList.remove('no-js');

    const meta = document.querySelector('meta[name="api-base-url"]');
    const metaContent = meta && meta.content ? meta.content.trim() : '';
    const isHttpProtocol = ['http:', 'https:'].includes(window.location.protocol);
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let baseUrl = metaContent;

    if (!baseUrl) {
        if (isGitHubPages) {
            // En GitHub Pages sin URL de API configurada
            console.warn('⚠️ GitHub Pages detectado sin URL de API configurada.');
            console.warn('Por favor, agrega una meta tag con la URL de tu API:');
            console.warn('<meta name="api-base-url" content="https://tu-api.com">');
            baseUrl = ''; // Sin backend configurado
        } else if (isLocalhost) {
            baseUrl = 'http://localhost:3000';
        } else {
            baseUrl = 'http://localhost:3000';
        }
    }

    baseUrl = baseUrl.replace(/\/$/, '');

    window.APP_CONFIG = window.APP_CONFIG || {};
    window.APP_CONFIG.apiBaseUrl = baseUrl;
    window.APP_CONFIG.isGitHubPages = isGitHubPages;
    window.APP_CONFIG.isLocalhost = isLocalhost;
    window.APP_CONFIG.hasBackend = !!baseUrl;
    window.APP_CONFIG.getApiUrl = function (path = '') {
        if (!path) {
            return baseUrl;
        }
        return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    };

    function ensureMessageContainer() {
        const existing = document.getElementById('message-region');
        if (existing) {
            return existing;
        }
        const container = document.createElement('div');
        container.id = 'message-region';
        container.className = 'message-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
        return container;
    }

    function showMessage(type, text) {
        const container = ensureMessageContainer();
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.setAttribute('role', type === 'error' ? 'alert' : 'status');
        message.textContent = text;

        container.appendChild(message);

        // Auto dismiss after 5 seconds with a fade-out
        setTimeout(() => {
            message.classList.add('hide');
            setTimeout(() => {
                if (message.parentElement) {
                    message.parentElement.removeChild(message);
                }
            }, 300);
        }, 5000);
    }

    window.showMessage = showMessage;
})();

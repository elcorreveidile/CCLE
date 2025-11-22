/* ========================================
   DASHBOARD - JAVASCRIPT
   Área privada de estudiantes del Intensivo 3
   ======================================== */

const API_URL = (window.APP_CONFIG && typeof window.APP_CONFIG.getApiUrl === 'function')
    ? window.APP_CONFIG.getApiUrl('/api')
    : 'http://localhost:3000/api';

// Estado global de la aplicación
const appState = {
    user: null,
    token: null,
    currentSection: 'overview',
    chatMessages: [],
    forumPosts: [],
    resources: [],
    attendance: []
};

/* ========================================
   INICIALIZACIÓN
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!checkAuth()) {
        return;
    }

    // Cargar datos del usuario
    await loadUserData();

    // Inicializar componentes
    initNavigation();
    initChat();
    initForum();
    initResources();
    initAttendance();
    initProgress();
    initProfile();

    // Mostrar sección inicial
    showSection('overview');
});

/* ========================================
   AUTENTICACIÓN
   ======================================== */

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        // Redirigir al login
        window.location.href = 'index.html';
        return false;
    }

    appState.token = token;
    appState.user = JSON.parse(user);
    return true;
}

async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${appState.token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token inválido o expirado
                logout();
                return;
            }
            throw new Error('Error al cargar datos del usuario');
        }

        const data = await response.json();
        appState.user = data.data.user;
        appState.stats = data.data.stats;

        // Actualizar UI con datos del usuario
        updateUserInfo();
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los datos del usuario', 'error');
    }
}

function updateUserInfo() {
    const user = appState.user;

    // Actualizar avatar y nombre en el sidebar
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-details h3');
    const userEmail = document.querySelector('.user-details p');

    if (userAvatar) {
        userAvatar.textContent = user.first_name.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = `${user.first_name} ${user.last_name}`;
    }

    if (userEmail) {
        userEmail.textContent = user.email;
    }

    // Actualizar header del dashboard
    const welcomeText = document.querySelector('.dashboard-header h1');
    if (welcomeText) {
        const hour = new Date().getHours();
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 20) greeting = 'Buenas tardes';
        if (hour >= 20 || hour < 6) greeting = 'Buenas noches';

        welcomeText.textContent = `${greeting}, ${user.first_name}`;
    }
}

function updateStats() {
    const stats = appState.stats;

    // Actualizar estadísticas en las tarjetas
    if (stats) {
        const attendanceCount = document.querySelector('.stat-card:nth-child(1) .stat-info h3');
        const forumPostsCount = document.querySelector('.stat-card:nth-child(2) .stat-info h3');
        const aiConversationsCount = document.querySelector('.stat-card:nth-child(3) .stat-info h3');
        const progressPercentage = document.querySelector('.stat-card:nth-child(4) .stat-info h3');

        if (attendanceCount) attendanceCount.textContent = stats.attendanceCount || 0;
        if (forumPostsCount) forumPostsCount.textContent = stats.forumPostsCount || 0;
        if (aiConversationsCount) aiConversationsCount.textContent = stats.aiConversationsCount || 0;
        if (progressPercentage) progressPercentage.textContent = '75%'; // Placeholder
    }
}

function logout() {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir al login
    window.location.href = 'index.html';
}

/* ========================================
   NAVEGACIÓN
   ======================================== */

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const logoutBtn = document.querySelector('.logout-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function showSection(sectionName) {
    // Actualizar estado
    appState.currentSection = sectionName;

    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar navegación activa
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });

    // Cargar datos específicos de la sección si es necesario
    switch (sectionName) {
        case 'ai-tutor':
            loadChatHistory();
            break;
        case 'forum':
            loadForumPosts();
            break;
        case 'resources':
            loadResourcesList();
            break;
        case 'attendance':
            loadAttendanceHistory();
            break;
        case 'progress':
            updateProgressCharts();
            break;
    }
}

/* ========================================
   CHAT CON PROFESOR VIRTUAL (AI)
   ======================================== */

function initChat() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const message = chatInput.value.trim();
            if (!message) return;

            // Añadir mensaje del usuario a la UI
            addChatMessage(message, 'user');
            chatInput.value = '';

            // Mostrar indicador de escritura
            showTypingIndicator();

            try {
                // Llamar a la API del backend
                const response = await fetch(`${API_URL}/ai/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${appState.token}`
                    },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();

                // Remover indicador de escritura
                removeTypingIndicator();

                if (data.success) {
                    // Añadir respuesta del AI
                    addChatMessage(data.data.response, 'ai');
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                removeTypingIndicator();
                console.error('Error:', error);

                // Respuesta de fallback mientras no esté implementado el backend
                addChatMessage(
                    'Lo siento, el profesor virtual estará disponible próximamente. Por ahora, puedes usar el foro para hacer tus preguntas a la comunidad.',
                    'ai'
                );
            }
        });
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${sender === 'user'
                ? appState.user.first_name.charAt(0).toUpperCase()
                : '<i class="fas fa-robot"></i>'
            }
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Guardar en el estado
    appState.chatMessages.push({ text, sender, time });
}

function showTypingIndicator() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-text">Escribiendo...</div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function loadChatHistory() {
    try {
        const response = await fetch(`${API_URL}/ai/conversations`, {
            headers: {
                'Authorization': `Bearer ${appState.token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const messagesContainer = document.querySelector('.chat-messages');

            if (messagesContainer && data.data.conversations) {
                messagesContainer.innerHTML = '';
                data.data.conversations.forEach(conv => {
                    addChatMessage(conv.message, 'user');
                    addChatMessage(conv.response, 'ai');
                });
            }
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
}

/* ========================================
   FORO
   ======================================== */

function initForum() {
    const newPostBtn = document.querySelector('.new-post-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (newPostBtn) {
        newPostBtn.addEventListener('click', openNewPostModal);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar filtros activos
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filtrar posts
            const category = btn.dataset.category;
            filterForumPosts(category);
        });
    });
}

async function loadForumPosts() {
    const forumPostsContainer = document.querySelector('.forum-posts');
    if (!forumPostsContainer) return;

    try {
        const response = await fetch(`${API_URL}/forum/posts`, {
            headers: {
                'Authorization': `Bearer ${appState.token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            appState.forumPosts = data.data.posts || [];
            renderForumPosts(appState.forumPosts);
        } else {
            // Datos de ejemplo mientras no esté implementado
            const samplePosts = [
                {
                    id: 1,
                    title: '¿Cómo usar el subjuntivo con "esperar"?',
                    content: 'Tengo dudas sobre cuándo usar el subjuntivo con el verbo esperar...',
                    author: 'María García',
                    category: 'gramatica',
                    replies: 5,
                    views: 23,
                    created_at: '2024-01-15T10:30:00'
                },
                {
                    id: 2,
                    title: 'Mejores tapas en Granada',
                    content: 'Comparto mi experiencia visitando bares de tapas en Granada...',
                    author: 'John Smith',
                    category: 'proyecto1',
                    replies: 8,
                    views: 45,
                    created_at: '2024-01-14T15:20:00'
                }
            ];
            renderForumPosts(samplePosts);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderForumPosts(posts) {
    const forumPostsContainer = document.querySelector('.forum-posts');
    if (!forumPostsContainer) return;

    if (posts.length === 0) {
        forumPostsContainer.innerHTML = '<p class="text-center text-medium-gray">No hay publicaciones todavía. ¡Sé el primero en publicar!</p>';
        return;
    }

    forumPostsContainer.innerHTML = posts.map(post => {
        const authorInitial = post.author ? post.author.charAt(0).toUpperCase() : 'U';
        const date = new Date(post.created_at).toLocaleDateString('es-ES');

        return `
            <div class="forum-post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${authorInitial}</div>
                        <div class="author-info">
                            <h4>${post.author || 'Usuario'}</h4>
                            <span>${date}</span>
                        </div>
                    </div>
                    <span class="post-category">${getCategoryName(post.category)}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content}</p>
                <div class="post-footer">
                    <span><i class="fas fa-comments"></i> ${post.replies || 0} respuestas</span>
                    <span><i class="fas fa-eye"></i> ${post.views || 0} vistas</span>
                </div>
            </div>
        `;
    }).join('');

    // Añadir event listeners a los posts
    document.querySelectorAll('.forum-post').forEach(post => {
        post.addEventListener('click', () => {
            const postId = post.dataset.postId;
            openPostDetail(postId);
        });
    });
}

function filterForumPosts(category) {
    if (category === 'todos') {
        renderForumPosts(appState.forumPosts);
    } else {
        const filtered = appState.forumPosts.filter(post => post.category === category);
        renderForumPosts(filtered);
    }
}

function getCategoryName(category) {
    const categories = {
        'general': 'General',
        'gramatica': 'Gramática',
        'proyecto1': 'Ruta de Tapas',
        'proyecto2': 'Serie España',
        'cultura': 'Cultura'
    };
    return categories[category] || category;
}

function openNewPostModal() {
    // TODO: Implementar modal para crear nuevo post
    showAlert('Funcionalidad de crear post próximamente disponible', 'info');
}

function openPostDetail(postId) {
    // TODO: Implementar vista detallada del post con respuestas
    console.log('Ver detalle del post:', postId);
}

/* ========================================
   RECURSOS
   ======================================== */

function initResources() {
    // Inicializar funcionalidad de recursos
}

async function loadResourcesList() {
    const resourcesGrid = document.querySelector('.resources-grid');
    if (!resourcesGrid) return;

    try {
        const response = await fetch(`${API_URL}/resources`, {
            headers: {
                'Authorization': `Bearer ${appState.token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            appState.resources = data.data.resources || [];
            renderResources(appState.resources);
        } else {
            // Datos de ejemplo
            const sampleResources = [
                {
                    id: 1,
                    title: 'Guía del Proyecto: Ruta de Tapas',
                    description: 'Documento completo con instrucciones para el proyecto',
                    file_type: 'pdf',
                    category: 'proyecto1',
                    week: 1
                },
                {
                    id: 2,
                    title: 'Vocabulario Gastronómico',
                    description: 'Lista de vocabulario para bares y restaurantes',
                    file_type: 'pdf',
                    category: 'proyecto1',
                    week: 1
                },
                {
                    id: 3,
                    title: 'Guía del Proyecto: Serie Para Mudarse a España',
                    description: 'Instrucciones para crear tu episodio',
                    file_type: 'pdf',
                    category: 'proyecto2',
                    week: 3
                }
            ];
            renderResources(sampleResources);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderResources(resources) {
    const resourcesGrid = document.querySelector('.resources-grid');
    if (!resourcesGrid) return;

    if (resources.length === 0) {
        resourcesGrid.innerHTML = '<p class="text-center">No hay recursos disponibles todavía.</p>';
        return;
    }

    resourcesGrid.innerHTML = resources.map(resource => {
        const icon = getFileIcon(resource.file_type);

        return `
            <div class="resource-card">
                <div class="resource-icon">
                    <i class="${icon}"></i>
                </div>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <div class="resource-meta">
                    <span><i class="fas fa-folder"></i> ${getCategoryName(resource.category)}</span>
                    <span><i class="fas fa-calendar"></i> Semana ${resource.week}</span>
                </div>
                <button class="download-btn" onclick="downloadResource(${resource.id})">
                    <i class="fas fa-download"></i> Descargar
                </button>
            </div>
        `;
    }).join('');
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'video': 'fas fa-file-video',
        'audio': 'fas fa-file-audio'
    };
    return icons[fileType] || 'fas fa-file';
}

function downloadResource(resourceId) {
    // TODO: Implementar descarga de recursos
    showAlert('Descarga iniciada', 'success');
}

/* ========================================
   ASISTENCIA
   ======================================== */

function initAttendance() {
    const scanBtn = document.querySelector('.scan-btn');

    if (scanBtn) {
        scanBtn.addEventListener('click', startQRScan);
    }
}

async function loadAttendanceHistory() {
    try {
        const response = await fetch(`${API_URL}/attendance/user`, {
            headers: {
                'Authorization': `Bearer ${appState.token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            appState.attendance = data.data.attendance || [];
            renderAttendanceHistory(appState.attendance);
            updateAttendanceStats();
        } else {
            // Datos de ejemplo
            const sampleAttendance = [
                {
                    date: '2024-01-15',
                    check_in_time: '09:00',
                    check_out_time: '13:00',
                    status: 'present'
                },
                {
                    date: '2024-01-14',
                    check_in_time: '09:15',
                    check_out_time: '13:00',
                    status: 'late'
                }
            ];
            renderAttendanceHistory(sampleAttendance);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderAttendanceHistory(attendance) {
    const tbody = document.querySelector('.attendance-history tbody');
    if (!tbody) return;

    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay registros de asistencia todavía.</td></tr>';
        return;
    }

    tbody.innerHTML = attendance.map(record => {
        const date = new Date(record.date).toLocaleDateString('es-ES');
        const statusText = getStatusText(record.status);

        return `
            <tr>
                <td>${date}</td>
                <td>${record.check_in_time || '-'}</td>
                <td>${record.check_out_time || '-'}</td>
                <td><span class="status-badge ${record.status}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

function getStatusText(status) {
    const statusTexts = {
        'present': 'Presente',
        'absent': 'Ausente',
        'late': 'Tardanza'
    };
    return statusTexts[status] || status;
}

function updateAttendanceStats() {
    // TODO: Calcular y actualizar estadísticas de asistencia
}

function startQRScan() {
    // TODO: Implementar escaneo de código QR
    showAlert('Funcionalidad de escaneo QR próximamente disponible', 'info');
}

/* ========================================
   PROGRESO
   ======================================== */

function initProgress() {
    // Inicializar gráficos de progreso
}

function updateProgressCharts() {
    // Actualizar progreso circular
    updateCircularProgress('overall-progress', 75);
    updateCircularProgress('project1-progress', 80);
    updateCircularProgress('project2-progress', 65);

    // Actualizar barras de habilidades
    updateSkillBar('conversacion', 85);
    updateSkillBar('gramatica', 75);
    updateSkillBar('vocabulario', 90);
    updateSkillBar('comprension', 70);
}

function updateCircularProgress(id, percentage) {
    const progressRing = document.querySelector(`#${id} .progress-ring-circle`);
    const progressValue = document.querySelector(`#${id} .progress-value`);

    if (!progressRing || !progressValue) return;

    const radius = progressRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = offset;
    progressValue.textContent = `${percentage}%`;
}

function updateSkillBar(skill, percentage) {
    const skillFill = document.querySelector(`#skill-${skill} .skill-fill`);
    const skillPercentage = document.querySelector(`#skill-${skill} .skill-percentage`);

    if (!skillFill || !skillPercentage) return;

    setTimeout(() => {
        skillFill.style.width = `${percentage}%`;
        skillPercentage.textContent = `${percentage}%`;
    }, 100);
}

/* ========================================
   PERFIL
   ======================================== */

function initProfile() {
    const profileForm = document.getElementById('profile-form');

    if (profileForm) {
        // Cargar datos actuales del usuario en el formulario
        loadProfileData();

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateUserProfile();
        });
    }
}

function loadProfileData() {
    const user = appState.user;

    // Llenar formulario con datos actuales
    document.getElementById('profile-first-name').value = user.first_name || '';
    document.getElementById('profile-last-name').value = user.last_name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-country').value = user.country || '';
    document.getElementById('profile-university').value = user.university || '';
    document.getElementById('profile-spanish-level').value = user.spanish_level || '';
}

async function updateUserProfile() {
    const formData = {
        first_name: document.getElementById('profile-first-name').value,
        last_name: document.getElementById('profile-last-name').value,
        phone: document.getElementById('profile-phone').value,
        university: document.getElementById('profile-university').value,
        spanish_level: document.getElementById('profile-spanish-level').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${appState.token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            appState.user = data.data;
            localStorage.setItem('user', JSON.stringify(data.data));
            updateUserInfo();
            showAlert('Perfil actualizado correctamente', 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al actualizar perfil', 'error');
    }
}

/* ========================================
   UTILIDADES
   ======================================== */

function showAlert(message, type = 'info') {
    if (window.showMessage) {
        window.showMessage(type, message);
        return;
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    alertDiv.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    // Insertar al principio del contenido principal
    const mainContent = document.querySelector('.dashboard-content');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Exponer funciones globales necesarias
window.downloadResource = downloadResource;
window.logout = logout;

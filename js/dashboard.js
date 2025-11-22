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

    // Cargar datos del usuario y configurar rol
    await loadUserData();
    setupUserRole();

    // Inicializar dashboard según rol
    await initDashboardByRole();

    // Mostrar sección inicial - todos ven "Inicio" (overview)
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

        console.log('User data loaded:', appState.user);
        console.log('User role:', appState.user.role);

        // Actualizar UI con datos del usuario
        updateUserInfo();
        updateStats();
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('error', 'Error al cargar datos del usuario');
    }
}

function setupUserRole() {
    const user = appState.user;
    if (!user) return;

    console.log('⭐ Setting up role for:', user.role);

    // Agregar clase al body según el rol del usuario
    if (user.role === 'professor' || user.role === 'teacher') {
        document.body.classList.add('professor-role');
        console.log('✅ Professor role applied to body');

        // Ocultar elementos específicos del menú para profesores
        hideStudentOnlyMenuItems();

        // Configurar navegación para profesor
        setupProfessorNavigation();

        // Mostrar contenido específico para profesores en Inicio
        showProfessorOverviewContent();
    } else {
        console.log('✅ Student role detected');
        // Asegurarse de que los estudiantes vean su contenido
        showStudentOverviewContent();
    }
}

function showProfessorOverviewContent() {
    console.log('👨‍🏫 Showing professor overview content');

    // Ocultar contenido de estudiantes
    const studentContent = document.querySelector('.student-overview-content');
    if (studentContent) {
        studentContent.style.display = 'none';
    }

    // Mostrar contenido de profesores
    const professorContent = document.querySelector('.professor-overview-content');
    if (professorContent) {
        professorContent.style.display = 'block';
    }

    // También ocultar la sección de proyectos que es para estudiantes
    const projectsSection = document.querySelector('.projects-section');
    if (projectsSection) {
        projectsSection.style.display = 'none';
    }
}

function showStudentOverviewContent() {
    console.log('👨‍🎓 Showing student overview content');

    // Mostrar contenido de estudiantes
    const studentContent = document.querySelector('.student-overview-content');
    if (studentContent) {
        studentContent.style.display = 'block';
    }

    // Ocultar contenido de profesores
    const professorContent = document.querySelector('.professor-overview-content');
    if (professorContent) {
        professorContent.style.display = 'none';
    }

    // Mostrar la sección de proyectos
    const projectsSection = document.querySelector('.projects-section');
    if (projectsSection) {
        projectsSection.style.display = 'block';
    }
}

function setupProfessorNavigation() {
    // No cambiar navegación - "Inicio" debe permanecer activo para profesores también
    console.log('✅ Professor navigation setup complete - Inicio remains active');
}

function hideStudentOnlyMenuItems() {
    console.log('🙈 Hiding student-only menu items');

    // Ocultar elementos del menú específicos de estudiantes
    const studentOnlySections = ['forum', 'resources', 'attendance', 'progress'];

    studentOnlySections.forEach(section => {
        const navLink = document.querySelector(`.nav-link[data-section="${section}"]`);
        if (navLink) {
            console.log(`❌ Hiding nav item: ${section}`);
            navLink.style.display = 'none';

            // También ocultar el padre nav-item
            const navItem = navLink.closest('.nav-item');
            if (navItem) {
                navItem.style.display = 'none';
            }
        }
    });

    // No ocultar overview - los profesores deben ver contenido en "Inicio"
    // const overviewSection = document.getElementById('overview-section');
    // if (overviewSection) {
    //     console.log('❌ Hiding overview section');
    //     overviewSection.style.display = 'none';
    // }
}

async function initDashboardByRole() {
    const user = appState.user;
    if (!user) return;

    console.log('🚀 Initializing dashboard for role:', user.role);

    if (user.role === 'professor' || user.role === 'teacher') {
        console.log('📚 Initializing professor dashboard');
        // Inicializaciones específicas para profesores
        await initializeProfessorDashboard();
    } else {
        console.log('👨‍🎓 Initializing student dashboard');
        // Inicializaciones específicas para estudiantes
        await initializeStudentDashboard();
    }
}

async function initializeProfessorDashboard() {
    console.log('👨‍🏫 Professor dashboard initialized');

    // Actualizar header para profesor
    updateProfessorHeader();

    // Configurar secciones de profesor
    setupProfessorSections();
}

async function initializeStudentDashboard() {
    console.log('👨‍🎓 Student dashboard initialized');
    // Configuraciones específicas para estudiantes
}

function updateProfessorHeader() {
    const headerTitle = document.querySelector('.dashboard-header h1');
    const headerSubtitle = document.querySelector('.dashboard-header p');

    if (headerTitle) {
        headerTitle.textContent = 'Panel del Profesor';
    }
    if (headerSubtitle) {
        headerSubtitle.textContent = 'Gestiona tus clases y estudiantes del Intensivo 3';
    }
}

function setupProfessorSections() {
    // Asegurar que las secciones de profesor estén disponibles
    const professorSections = ['courses', 'students', 'attendance-qr', 'ai-tutor'];
    console.log('📋 Professor sections available:', professorSections);

    // Inicializar funcionalidad específica de profesor
    setupStudentsFilters();
    loadStudentsData();
}

/* ========================================
   STUDENTS MANAGEMENT
   ======================================== */

function setupStudentsFilters() {
    const courseFilter = document.getElementById('courseFilter');

    if (courseFilter) {
        // Agregar event listener para el filtro
        courseFilter.addEventListener('change', filterStudents);

        // Cargar cursos disponibles
        loadCoursesForFilter();

        console.log('✅ Students filters setup complete');
    }
}

async function loadCoursesForFilter() {
    const courseFilter = document.getElementById('courseFilter');
    if (!courseFilter) return;

    // Datos de ejemplo de cursos - matching the student data course names
    const courses = [
        { id: 'course1', name: 'Intensivo 3 - Conversación' },
        { id: 'course2', name: 'Intensivo 3 - Gramática' },
        { id: 'course3', name: 'Intensivo 3 - Cultura' }
    ];

    // Limpiar opciones existentes (excepto la primera)
    courseFilter.innerHTML = '<option value="">Todos los cursos</option>';

    // Agregar cursos al filtro
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseFilter.appendChild(option);
    });

    console.log('📚 Courses loaded for filter:', courses.map(c => c.name));
}

async function loadStudentsData() {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;

    try {
        // Datos de ejemplo de estudiantes
        const students = [
            {
                id: 1,
                name: 'María García',
                email: 'maria.garcia@email.com',
                course: 'course1',
                courseName: 'Intensivo 3 - Conversación',
                attendance: 95,
                progress: 78,
                lastActivity: '2025-01-21',
                status: 'active'
            },
            {
                id: 2,
                name: 'Juan López',
                email: 'juan.lopez@email.com',
                course: 'course1',
                courseName: 'Intensivo 3 - Conversación',
                attendance: 88,
                progress: 65,
                lastActivity: '2025-01-20',
                status: 'active'
            },
            {
                id: 3,
                name: 'Ana Martínez',
                email: 'ana.martinez@email.com',
                course: 'course2',
                courseName: 'Intensivo 3 - Gramática',
                attendance: 92,
                progress: 82,
                lastActivity: '2025-01-21',
                status: 'active'
            },
            {
                id: 4,
                name: 'Carlos Rodríguez',
                email: 'carlos.rodriguez@email.com',
                course: 'course2',
                courseName: 'Intensivo 3 - Gramática',
                attendance: 76,
                progress: 58,
                lastActivity: '2025-01-19',
                status: 'warning'
            },
            {
                id: 5,
                name: 'Laura Sánchez',
                email: 'laura.sanchez@email.com',
                course: 'course3',
                courseName: 'Intensivo 3 - Cultura',
                attendance: 98,
                progress: 91,
                lastActivity: '2025-01-21',
                status: 'active'
            },
            {
                id: 6,
                name: 'Miguel Fernández',
                email: 'miguel.fernandez@email.com',
                course: 'course3',
                courseName: 'Intensivo 3 - Cultura',
                attendance: 85,
                progress: 72,
                lastActivity: '2025-01-18',
                status: 'warning'
            }
        ];

        // Guardar datos en el estado global
        appState.allStudents = students;
        appState.filteredStudents = students;

        // Renderizar estudiantes
        renderStudents(students);

        console.log('✅ Students data loaded:', students.length, 'students');
    } catch (error) {
        console.error('Error loading students data:', error);
        if (studentsList) {
            studentsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los datos de estudiantes</p>
                </div>
            `;
        }
    }
}

function renderStudents(students) {
    const studentsList = document.getElementById('studentsList');
    if (!studentsList) return;

    if (students.length === 0) {
        studentsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-users-slash"></i>
                <p>No se encontraron estudiantes con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    const studentsHTML = students.map(student => {
        const statusClass = student.status === 'active' ? 'success' : 'warning';
        const statusIcon = student.status === 'active' ? 'check-circle' : 'exclamation-triangle';
        const statusText = student.status === 'active' ? 'Activo' : 'Necesita atención';

        return `
            <div class="student-card" data-course="${student.course}">
                <div class="student-header">
                    <div class="student-info">
                        <h3 class="student-name">${student.name}</h3>
                        <p class="student-email">${student.email}</p>
                        <span class="student-course">${student.courseName}</span>
                    </div>
                    <div class="student-status">
                        <span class="status-badge ${statusClass}">
                            <i class="fas fa-${statusIcon}"></i>
                            ${statusText}
                        </span>
                    </div>
                </div>
                <div class="student-stats">
                    <div class="stat-item">
                        <span class="stat-label">Asistencia</span>
                        <span class="stat-value">${student.attendance}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Progreso</span>
                        <span class="stat-value">${student.progress}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Última actividad</span>
                        <span class="stat-value">${formatDate(student.lastActivity)}</span>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewStudentDetails(${student.id})">
                        <i class="fas fa-eye"></i>
                        Ver detalles
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="contactStudent(${student.id})">
                        <i class="fas fa-envelope"></i>
                        Contactar
                    </button>
                </div>
            </div>
        `;
    }).join('');

    studentsList.innerHTML = `
        <div class="students-grid">
            ${studentsHTML}
        </div>
    `;
}

function filterStudents() {
    const courseFilter = document.getElementById('courseFilter');
    if (!courseFilter || !appState.allStudents) {
        console.error('❌ Missing elements for filtering');
        return;
    }

    const selectedCourse = courseFilter.value;
    const selectedCourseText = courseFilter.options[courseFilter.selectedIndex]?.text || 'Todos los cursos';
    console.log('🔍 Filter change - Selected value:', selectedCourse, 'Selected text:', selectedCourseText);
    console.log('📊 Total students before filter:', appState.allStudents.length);

    let filtered = appState.allStudents;

    // Filtrar por curso si se selecciona uno
    if (selectedCourse) {
        filtered = filtered.filter(student => {
            const matches = student.course === selectedCourse;
            console.log(`Student ${student.name} (${student.course}) matches ${selectedCourse}: ${matches}`);
            return matches;
        });
    }

    // Guardar resultados filtrados
    appState.filteredStudents = filtered;

    // Renderizar estudiantes filtrados
    renderStudents(filtered);

    console.log('✅ Filter applied - Results:', filtered.length, 'students for course:', selectedCourseText);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

function viewStudentDetails(studentId) {
    const student = appState.allStudents.find(s => s.id === studentId);
    if (student) {
        console.log('👤 Viewing student details:', student);
        showMessage('info', `Viendo detalles de ${student.name}`);
    }
}

function contactStudent(studentId) {
    const student = appState.allStudents.find(s => s.id === studentId);
    if (student) {
        console.log('✉️ Contacting student:', student);
        showMessage('info', `Abriendo email para ${student.email}`);
        // Aquí se podría abrir un cliente de email
        window.location.href = `mailto:${student.email}`;
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
   DASHBOARD POR ROL
   ======================================== */

function initDashboardByRole() {
    const user = appState.user;
    console.log('Initializing dashboard for user:', user.email, 'with role:', user.role);

    // Check for professor roles (support both 'professor' and 'teacher')
    if (user.role === 'professor' || user.role === 'teacher') {
        initProfessorDashboard(user);
    } else {
        initStudentDashboard(user);
    }
}

function initProfessorDashboard(user) {
    console.log('*** INITIALIZING PROFESSOR DASHBOARD for:', user.first_name, user.last_name, '***');

    // Update welcome message for professor
    const welcomeText = document.querySelector('.dashboard-header h1');
    if (welcomeText) {
        const hour = new Date().getHours();
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 20) greeting = 'Buenas tardes';
        if (hour >= 20 || hour < 6) greeting = 'Buenas noches';

        welcomeText.textContent = `${greeting}, Profesor ${user.last_name}`;
        console.log('Updated welcome text to:', welcomeText.textContent);
    } else {
        console.log('Could not find welcome text element');
    }

    // Update header subtitle
    const headerSubtitle = document.querySelector('.dashboard-header p');
    if (headerSubtitle) {
        headerSubtitle.textContent = 'Gestiona tus cursos y supervisa el progreso de los estudiantes';
        console.log('Updated header subtitle to:', headerSubtitle.textContent);
    }

    // Show professor-specific navigation
    console.log('Updating professor navigation...');
    updateProfessorNavigation();

    // Load professor-specific content
    console.log('Loading professor stats...');
    loadProfessorStats();
    console.log('Loading professor courses...');
    loadProfessorCourses();

    // Hide student-specific sections
    console.log('Hiding student sections...');
    hideStudentSections();

    console.log('*** PROFESSOR DASHBOARD INITIALIZATION COMPLETE ***');
}

function initStudentDashboard(user) {
    console.log('*** INITIALIZING STUDENT DASHBOARD for:', user.first_name, user.last_name, '***');

    // Update welcome message for student
    const welcomeText = document.querySelector('.dashboard-header h1');
    if (welcomeText) {
        const hour = new Date().getHours();
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 20) greeting = 'Buenas tardes';
        if (hour >= 20 || hour < 6) greeting = 'Buenas noches';

        welcomeText.textContent = `${greeting}, ${user.first_name}`;
        console.log('Updated welcome text to:', welcomeText.textContent);
    } else {
        console.log('Could not find welcome text element');
    }

    // Update header subtitle
    const headerSubtitle = document.querySelector('.dashboard-header p');
    if (headerSubtitle) {
        headerSubtitle.textContent = 'Gestiona tu aprendizaje y progreso en el Intensivo 3';
        console.log('Updated header subtitle to:', headerSubtitle.textContent);
    }

    // Show student-specific navigation
    console.log('Updating student navigation...');
    updateStudentNavigation();

    // Load student-specific content
    console.log('Loading student content...');
    loadStudentContent();

    console.log('*** STUDENT DASHBOARD INITIALIZATION COMPLETE ***');
}

function updateProfessorNavigation() {
    const navContainer = document.querySelector('.sidebar-nav');

    // Update navigation for professors
    navContainer.innerHTML = `
        <div class="nav-item">
            <a href="#" class="nav-link active" data-section="overview">
                <i class="fas fa-home"></i>
                <span>Panel Profesor</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="courses">
                <i class="fas fa-book"></i>
                <span>Mis Cursos</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="students">
                <i class="fas fa-users"></i>
                <span>Estudiantes</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="attendance">
                <i class="fas fa-calendar-check"></i>
                <span>Control de Asistencia</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="attendance-qr">
                <i class="fas fa-qrcode"></i>
                <span>Generar QR</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="ai-tutor">
                <i class="fas fa-robot"></i>
                <span>Profesor Virtual</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="resources">
                <i class="fas fa-folder-open"></i>
                <span>Recursos</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="profile">
                <i class="fas fa-user-circle"></i>
                <span>Mi Perfil</span>
            </a>
        </div>
    `;

    // Re-attach event listeners
    initNavigation();
}

function updateStudentNavigation() {
    // Keep the current student navigation (already in HTML)
    const navContainer = document.querySelector('.sidebar-nav');

    // Ensure student navigation is correct
    if (!navContainer.querySelector('[data-section="progress"]')) {
        navContainer.innerHTML = `
            <div class="nav-item">
                <a href="#" class="nav-link active" data-section="overview">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="ai-tutor">
                    <i class="fas fa-robot"></i>
                    <span>Profesor Virtual</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="forum">
                    <i class="fas fa-comments"></i>
                    <span>Foro</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="resources">
                    <i class="fas fa-folder-open"></i>
                    <span>Recursos</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="attendance">
                    <i class="fas fa-calendar-check"></i>
                    <span>Asistencia</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="progress">
                    <i class="fas fa-chart-line"></i>
                    <span>Mi Progreso</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#" class="nav-link" data-section="profile">
                    <i class="fas fa-user-circle"></i>
                    <span>Perfil</span>
                </a>
            </div>
        `;

        // Re-attach event listeners
        initNavigation();
    }
}

function loadProfessorStats() {
    // Update stats cards for professors
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon primary">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalStudents">-</h3>
                    <p>Total Estudiantes</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalCourses">-</h3>
                    <p>Mis Cursos</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon info">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <h3 id="attendanceRate">-%</h3>
                    <p>Tasa Asistencia</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon warning">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <h3 id="avgProgress">-%</h3>
                    <p>Progreso Promedio</p>
                </div>
            </div>
        `;
    }

    // Load real stats from API
    fetchProfessorStatistics();
}

function loadProfessorCourses() {
    // Update overview section for professors
    const overviewSection = document.getElementById('overview-section');
    if (overviewSection) {
        const currentProjects = overviewSection.querySelector('.projects-section');
        if (currentProjects) {
            currentProjects.innerHTML = `
                <h2 class="section-title">
                    <i class="fas fa-book"></i>
                    Mis Cursos
                </h2>
                <div id="professor-courses" class="courses-grid">
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando cursos...</p>
                    </div>
                </div>
            `;
        }

        // Add quick actions for professors
        const quickActions = overviewSection.querySelector('.quick-actions');
        if (quickActions) {
            quickActions.innerHTML = `
                <h3>Acciones Rápidas</h3>
                <div class="actions-grid">
                    <button class="action-btn" onclick="switchSection('attendance-qr')">
                        <i class="fas fa-qrcode"></i>
                        <span>Generar QR Asistencia</span>
                    </button>
                    <button class="action-btn" onclick="switchSection('students')">
                        <i class="fas fa-users"></i>
                        <span>Ver Estudiantes</span>
                    </button>
                    <button class="action-btn" onclick="switchSection('courses')">
                        <i class="fas fa-chart-line"></i>
                        <span>Estadísticas del Curso</span>
                    </button>
                    <button class="action-btn" onclick="window.open('attendance.html', '_blank')">
                        <i class="fas fa-calendar-check"></i>
                        <span>Control de Asistencia</span>
                    </button>
                </div>
            `;
        }

        // Load real courses
        fetchProfessorCourses();
    }
}

function hideStudentSections() {
    console.log('Hiding student sections and showing professor sections...');

    // Hide student-specific sections
    const studentSections = ['forum-section', 'progress-section'];
    studentSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            section.classList.remove('active');
            console.log('Hidden student section:', sectionId);
        }
    });

    // Hide all other sections first
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Show professor-specific sections
    const professorSections = ['overview-section', 'courses-section', 'students-section', 'attendance-section', 'attendance-qr-section', 'ai-tutor-section', 'resources-section', 'profile-section'];
    professorSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            console.log('Made visible professor section:', sectionId);
        }
    });
}

function fetchProfessorStatistics() {
    // This would be implemented to call the real API
    // For now, showing placeholder data
    setTimeout(() => {
        const totalStudents = document.getElementById('totalStudents');
        const totalCourses = document.getElementById('totalCourses');
        const attendanceRate = document.getElementById('attendanceRate');
        const avgProgress = document.getElementById('avgProgress');

        if (totalStudents) totalStudents.textContent = '24';
        if (totalCourses) totalCourses.textContent = '2';
        if (attendanceRate) attendanceRate.textContent = '87%';
        if (avgProgress) avgProgress.textContent = '72%';
    }, 1000);
}

function fetchProfessorCourses() {
    const coursesContainer = document.getElementById('professor-courses');
    if (!coursesContainer) return;

    // This would be implemented to call the real API
    // For now, showing placeholder courses
    setTimeout(() => {
        coursesContainer.innerHTML = `
            <div class="course-card">
                <div class="course-header">
                    <h3>Intensivo 3 - Español A2.1</h3>
                    <span class="course-badge active">Activo</span>
                </div>
                <p>Curso intensivo de español para estudiantes extranjeros</p>
                <div class="course-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>24 estudiantes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar-check"></i>
                        <span>87% asistencia</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-chart-line"></i>
                        <span>72% progreso</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="switchSection('students')">
                    <i class="fas fa-users"></i> Ver Estudiantes
                </button>
            </div>

            <div class="course-card">
                <div class="course-header">
                    <h3>Intensivo 3 - Conversación</h3>
                    <span class="course-badge active">Activo</span>
                </div>
                <p>Clase de conversación para práctica oral</p>
                <div class="course-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>18 estudiantes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar-check"></i>
                        <span>91% asistencia</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-chart-line"></i>
                        <span>68% progreso</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="switchSection('students')">
                    <i class="fas fa-users"></i> Ver Estudiantes
                </button>
            </div>
        `;
    }, 1000);
}

function loadStudentContent() {
    // Load student-specific content (current implementation remains)
    // This function can be used to load additional student-specific data
}

function updateProfessorNavigation() {
    const navContainer = document.querySelector('.sidebar-nav');

    if (!navContainer) {
        console.log('Navigation container not found');
        return;
    }

    console.log('Updating professor navigation...');

    // Update navigation for professors
    navContainer.innerHTML = `
        <div class="nav-item">
            <a href="#" class="nav-link active" data-section="overview">
                <i class="fas fa-home"></i>
                <span>Panel Profesor</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="courses">
                <i class="fas fa-book"></i>
                <span>Mis Cursos</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="students">
                <i class="fas fa-users"></i>
                <span>Estudiantes</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="attendance">
                <i class="fas fa-calendar-check"></i>
                <span>Control de Asistencia</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="attendance-qr">
                <i class="fas fa-qrcode"></i>
                <span>Generar QR</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="ai-tutor">
                <i class="fas fa-robot"></i>
                <span>Configurar Profesor Virtual</span>
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" data-section="profile">
                <i class="fas fa-user-circle"></i>
                <span>Mi Perfil</span>
            </a>
        </div>
    `;

    console.log('Professor navigation updated');

    // Re-attach event listeners after updating HTML
    setupNavigation();
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

/* ========================================
   DASHBOARD INITIALIZATION BY ROLE
   ======================================== */

function initDashboardByRole() {
    const user = appState.user;
    console.log('Initializing dashboard for role:', user.role);

    if (user.role === 'professor' || user.role === 'teacher') {
        console.log('Initializing professor dashboard...');
        initProfessorDashboard(user);
    } else {
        console.log('Initializing student dashboard...');
        initStudentDashboard(user);
    }
}

function initProfessorDashboard(user) {
    console.log('🎓 Setting up professor dashboard for:', user.first_name);

    // Initialize all the components
    initNavigation();
    initChat();
    initForum();
    initResources();
    initAttendance();
    initProgress();
    initProfile();

    // Setup navigation event listeners
    setupNavigation();

    // Force update professor header immediately
    setTimeout(() => {
        updateProfessorHeader(user);
    }, 100);

    // Show professor overview
    showSection('overview');
}

function updateProfessorHeader(user) {
    console.log('🔄 Updating professor header...');

    const headerTitle = document.querySelector('.dashboard-header h1');
    const headerSubtitle = document.querySelector('.dashboard-header p');

    if (headerTitle) {
        headerTitle.textContent = `Bienvenido, Profesor ${user.first_name}`;
        console.log('✅ Header title updated to:', headerTitle.textContent);
    } else {
        console.error('❌ Header title element not found');
    }

    if (headerSubtitle) {
        headerSubtitle.textContent = 'Gestiona tus cursos y supervisa el progreso de los estudiantes';
        console.log('✅ Header subtitle updated');
    } else {
        console.error('❌ Header subtitle element not found');
    }
}

function initStudentDashboard(user) {
    console.log('Setting up student dashboard for:', user.first_name);

    // Initialize student components
    initNavigation();
    initChat();
    initForum();
    initResources();
    initAttendance();
    initProgress();
    initProfile();

    // Setup navigation event listeners
    setupNavigation();

    // Show student overview
    showSection('overview');
}

/* ========================================
   NAVIGATION FUNCTIONS
   ======================================== */

function initNavigation() {
    const user = appState.user;
    console.log('Initializing navigation for user:', user);

    if (user && (user.role === 'professor' || user.role === 'teacher')) {
        updateProfessorNavigation(user);
    } else {
        updateStudentNavigation(user);
    }
}

function updateProfessorNavigation(user) {
    console.log('🎓 Setting up professor navigation for:', user.first_name);

    // Update user info in sidebar
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-details h3');
    const userEmail = document.querySelector('.user-details p');

    if (userAvatar) {
        const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
        userAvatar.textContent = initials;
        console.log('✅ Updated user avatar');
    }

    if (userName) {
        userName.textContent = `${user.first_name} ${user.last_name}`;
        console.log('✅ Updated user name');
    }
    if (userEmail) {
        userEmail.textContent = user.email;
        console.log('✅ Updated user email');
    }

    // Show/hide navigation items based on role
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const section = item.querySelector('a')?.dataset.section;

        // Professor-only sections
        if (['courses', 'students', 'attendance-qr'].includes(section)) {
            item.style.display = 'block';
        }

        // Hide student-only sections for professors
        if (['resources'].includes(section)) {
            item.style.display = 'none';
        }
    });

    // Update dashboard header - try multiple selectors
    const headerTitle = document.querySelector('.dashboard-header h1');
    const headerSubtitle = document.querySelector('.dashboard-header p');

    if (headerTitle) {
        headerTitle.textContent = `Bienvenido, Profesor ${user.first_name}`;
        console.log('✅ Updated header title');
    } else {
        console.log('⚠️ Header title not found');
    }

    if (headerSubtitle) {
        headerSubtitle.textContent = 'Gestiona tus cursos y supervisa el progreso de los estudiantes';
        console.log('✅ Updated header subtitle');
    } else {
        console.log('⚠️ Header subtitle not found');
    }
}

function updateStudentNavigation(user) {
    console.log('Setting up student navigation for:', user.first_name);

    // Update user info in sidebar
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-details h3');
    const userEmail = document.querySelector('.user-details p');

    if (userAvatar) {
        const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
        userAvatar.textContent = initials;
    }

    if (userName) userName.textContent = `${user.first_name} ${user.last_name}`;
    if (userEmail) userEmail.textContent = user.email;

    // Hide professor-only sections for students
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const section = item.querySelector('a').dataset.section;

        // Hide professor-only sections
        if (['courses', 'students', 'attendance-qr'].includes(section)) {
            item.style.display = 'none';
        }

        // Show student sections
        if (['resources'].includes(section)) {
            item.style.display = 'block';
        }
    });

    // Update dashboard header
    const headerTitle = document.querySelector('.dashboard-header h1');
    const headerSubtitle = document.querySelector('.dashboard-header p');
    if (headerTitle) headerTitle.textContent = `Bienvenido, ${user.first_name}`;
    if (headerSubtitle) headerSubtitle.textContent = 'Gestiona tu aprendizaje y progreso en el Intensivo 3';
}

// Show Section function
function showSection(sectionName) {
    console.log('🔄 showSection called with:', sectionName);
    console.log('👤 User role:', appState.user?.role);

    // Hide all sections first
    const sections = document.querySelectorAll('.content-section');
    console.log('📄 Found sections:', sections.length);
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        console.log('✅ Found target section:', targetSection.id);
        targetSection.classList.add('active');
        targetSection.style.display = 'block';

        // Initialize professor-specific sections with a delay
        if (appState.user && (appState.user.role === 'professor' || appState.user.role === 'teacher')) {
            console.log('🎓 Professor user detected, initializing section...');

            setTimeout(() => {
                switch(sectionName) {
                    case 'courses':
                        console.log('📚 Initializing courses...');
                        initProfessorCourses();
                        break;
                    case 'students':
                        console.log('👥 Initializing students...');
                        initStudentsSection();
                        break;
                    case 'attendance-qr':
                        console.log('📱 Initializing QR generator...');
                        initQRGenerator();
                        break;
                    case 'ai-tutor':
                        console.log('🤖 Initializing AI tutor...');
                        initProfessorAITutor();
                        break;
                }
            }, 200);
        }
    } else {
        console.error('❌ Target section not found:', `${sectionName}-section`);
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('🔗 Found nav links:', navLinks.length);
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            console.log('✅ Activating nav link for:', sectionName);
            link.classList.add('active');
        }
    });
}

/* ========================================
   PROFESSOR SECTION FUNCTIONS
   ======================================== */

// Professor Courses Management
function initProfessorCourses() {
    console.log('🎓 initProfessorCourses() called');

    // Setup event listeners
    const newCourseBtn = document.getElementById('newCourseBtn');
    if (newCourseBtn) {
        newCourseBtn.addEventListener('click', showNewCourseModal);
        console.log('✅ New course button listener added');
    } else {
        console.log('⚠️ New course button not found');
    }

    // Load professor courses immediately
    loadProfessorCourses();
}

function loadProfessorCourses() {
    const coursesContainer = document.getElementById('professorCoursesList');
    if (!coursesContainer) {
        console.error('❌ coursesContainer not found');
        return;
    }

    console.log('📚 loadProfessorCourses() - Found container, loading courses...');

    // Load courses immediately
    const coursesHTML = `
        <div class="courses-grid">
            <div class="course-card">
                <div class="course-header">
                    <h3>Intensivo 3 - Español A2.1</h3>
                    <span class="course-badge active">Activo</span>
                </div>
                <p>Curso intensivo de español para estudiantes extranjeros. Nivel A2.1 con enfoque comunicativo.</p>
                <div class="course-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>24 estudiantes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar-check"></i>
                        <span>87% asistencia</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-chart-line"></i>
                        <span>72% progreso</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn btn-primary" onclick="viewCourseStudents(1)">
                        <i class="fas fa-users"></i> Ver Estudiantes
                    </button>
                    <button class="btn btn-secondary" onclick="viewCourseDetails(1)">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                </div>
            </div>

            <div class="course-card">
                <div class="course-header">
                    <h3>Intensivo 3 - Conversación</h3>
                    <span class="course-badge active">Activo</span>
                </div>
                <p>Clase de conversación para práctica oral y desarrollo de fluidez en español.</p>
                <div class="course-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>18 estudiantes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar-check"></i>
                        <span>91% asistencia</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-chart-line"></i>
                        <span>68% progreso</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn btn-primary" onclick="viewCourseStudents(2)">
                        <i class="fas fa-users"></i> Ver Estudiantes
                    </button>
                    <button class="btn btn-secondary" onclick="viewCourseDetails(2)">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                </div>
            </div>
        </div>
    `;

    coursesContainer.innerHTML = coursesHTML;
    console.log('✅ Courses loaded successfully');
}

// Students Management
function initStudentsSection() {
    console.log('👥 initStudentsSection() called');

    // Setup course filter
    const courseFilter = document.getElementById('courseFilter');
    if (courseFilter) {
        courseFilter.addEventListener('change', filterStudents);
        console.log('✅ Course filter listener added');
        populateCourseFilter();
    } else {
        console.log('⚠️ Course filter not found');
    }

    // Load students
    loadStudents();
}

function populateCourseFilter() {
    const courseFilter = document.getElementById('courseFilter');
    if (!courseFilter) return;

    // This would be replaced with actual API call
    const courses = [
        { id: 1, name: 'Intensivo 3 - Español A2.1' },
        { id: 2, name: 'Intensivo 3 - Conversación' }
    ];

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseFilter.appendChild(option);
    });
}

function loadStudents() {
    const studentsContainer = document.getElementById('studentsList');
    if (!studentsContainer) {
        console.error('❌ studentsContainer not found');
        return;
    }

    console.log('👥 loadStudents() - Found container, loading students...');

    const studentsHTML = `
        <div class="students-list">
            ${generateStudentHTML({
                id: 1,
                name: 'María García',
                email: 'maria@ejemplo.com',
                attendance: 92,
                progress: 78,
                course: 'Intensivo 3 - Español A2.1'
            })}
            ${generateStudentHTML({
                id: 2,
                name: 'John Smith',
                email: 'john@ejemplo.com',
                attendance: 85,
                progress: 82,
                course: 'Intensivo 3 - Español A2.1'
            })}
            ${generateStudentHTML({
                id: 3,
                name: 'Li Wei',
                email: 'liwei@ejemplo.com',
                attendance: 88,
                progress: 75,
                course: 'Intensivo 3 - Conversación'
            })}
            ${generateStudentHTML({
                id: 4,
                name: 'Sophie Martin',
                email: 'sophie@ejemplo.com',
                attendance: 95,
                progress: 90,
                course: 'Intensivo 3 - Conversación'
            })}
        </div>
    `;

    studentsContainer.innerHTML = studentsHTML;
    console.log('✅ Students loaded successfully');
}

function generateStudentHTML(student) {
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `
        <div class="student-item">
            <div class="student-avatar">${initials}</div>
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>${student.email} | ${student.course}</p>
            </div>
            <div class="student-stats">
                <div class="student-stat">
                    <strong>${student.attendance}%</strong>
                    <span>Asistencia</span>
                </div>
                <div class="student-stat">
                    <strong>${student.progress}%</strong>
                    <span>Progreso</span>
                </div>
            </div>
        </div>
    `;
}

// QR Generator
function initQRGenerator() {
    console.log('Initializing QR generator section...');

    // Setup form
    const qrForm = document.getElementById('qrGeneratorForm');
    if (qrForm) {
        qrForm.addEventListener('submit', handleQRGeneration);
        populateCourseSelect();
    }
}

function populateCourseSelect() {
    const qrCourse = document.getElementById('qrCourse');
    if (!qrCourse) return;

    // This would be replaced with actual API call
    const courses = [
        { id: 1, name: 'Intensivo 3 - Español A2.1' },
        { id: 2, name: 'Intensivo 3 - Conversación' }
    ];

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        qrCourse.appendChild(option);
    });
}

async function handleQRGeneration(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const qrData = {
        course_id: formData.get('qrCourse'),
        location: formData.get('qrLocation'),
        duration: formData.get('qrDuration'),
        type: formData.get('qrType')
    };

    try {
        // This would be replaced with actual API call
        console.log('Generating QR for:', qrData);

        // Simulate API call
        setTimeout(() => {
            showQRResult({
                qr_code: 'DEMO-QR-' + Date.now(),
                expires_at: new Date(Date.now() + parseInt(qrData.duration) * 60000).toLocaleString('es-ES')
            });
        }, 1000);

    } catch (error) {
        console.error('Error generating QR:', error);
        showAlert('Error al generar código QR', 'error');
    }
}

function showQRResult(qrData) {
    const qrResult = document.getElementById('qrResult');
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    const qrCodeElement = document.getElementById('qrCode');
    const qrExpiryElement = document.getElementById('qrExpiry');

    if (qrResult && qrCodeDisplay && qrCodeElement && qrExpiryElement) {
        // Generate QR code (using a simple placeholder for now)
        qrCodeDisplay.innerHTML = `
            <div style="width: 200px; height: 200px; background: white; border: 2px solid var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: bold;">
                QR: ${qrData.qr_code}
            </div>
        `;

        qrCodeElement.textContent = qrData.qr_code;
        qrExpiryElement.textContent = qrData.expires_at;

        qrResult.style.display = 'block';

        // Scroll to result
        qrResult.scrollIntoView({ behavior: 'smooth' });
    }
}

// QR Generator Functions
function initQRGenerator() {
    console.log('Initializing QR generator section...');

    // Setup form
    const qrForm = document.getElementById('qrGeneratorForm');
    if (qrForm) {
        qrForm.addEventListener('submit', handleQRGeneration);
        populateCourseSelect();
    }
}

function populateCourseSelect() {
    const qrCourse = document.getElementById('qrCourse');
    if (!qrCourse) {
        console.warn('QR Course select element not found');
        return;
    }

    console.log('Populating course select for QR generator');

    // Clear existing options
    qrCourse.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione un curso';
    qrCourse.appendChild(defaultOption);

    // This would be replaced with actual API call
    const courses = [
        { id: 1, name: 'Intensivo 3 - Español A2.1' },
        { id: 2, name: 'Intensivo 3 - Conversación' }
    ];

    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        qrCourse.appendChild(option);
    });

    console.log(`Added ${courses.length} courses to QR selector`);
}

async function handleQRGeneration(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const qrData = {
        course_id: formData.get('qrCourse'),
        location: formData.get('qrLocation'),
        duration: formData.get('qrDuration'),
        type: formData.get('qrType')
    };

    console.log('Generating QR with data:', qrData);

    try {
        // This would be replaced with actual API call
        // For now, simulate API call with real data
        const qrCode = 'ATT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const expiresAt = new Date(Date.now() + parseInt(qrData.duration) * 60000);

        setTimeout(() => {
            showQRResult({
                qr_code: qrCode,
                course_id: qrData.course_id,
                location: qrData.location,
                expires_at: expiresAt.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        }, 500);

    } catch (error) {
        console.error('Error generating QR:', error);
        showAlert('Error al generar código QR', 'error');
    }
}

function showQRResult(qrData) {
    const qrResult = document.getElementById('qrResult');
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    const qrCodeElement = document.getElementById('qrCode');
    const qrExpiryElement = document.getElementById('qrExpiry');

    if (qrResult && qrCodeDisplay && qrCodeElement && qrExpiryElement) {
        // Clear previous QR code
        qrCodeDisplay.innerHTML = '';

        // Generate QR data with timestamp and validation info
        const qrDataString = JSON.stringify({
            code: qrData.qr_code,
            course_id: qrData.course_id || 1,
            location: qrData.location || 'Clase',
            timestamp: new Date().toISOString(),
            expires_at: qrData.expires_at,
            type: 'attendance'
        });

        // Generate real QR code
        try {
            new QRCode(qrCodeDisplay, {
                text: qrDataString,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            // Fallback to simple display
            qrCodeDisplay.innerHTML = `
                <div style="width: 200px; height: 200px; background: white; border: 2px solid var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: bold; text-align: center; padding: 10px; font-size: 12px;">
                    ${qrData.qr_code}
                </div>
            `;
        }

        qrCodeElement.textContent = qrData.qr_code;
        qrExpiryElement.textContent = qrData.expires_at;

        qrResult.style.display = 'block';

        // Scroll to result
        qrResult.scrollIntoView({ behavior: 'smooth' });
    }
}

// Professor AI Tutor Configuration
function initProfessorAITutor() {
    console.log('Initializing professor AI tutor section...');

    const aiTutorSection = document.getElementById('ai-tutor-section');
    if (!aiTutorSection) return;

    // Update AI tutor section for professors
    const sectionHeader = aiTutorSection.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.innerHTML = `
            <h1><i class="fas fa-robot"></i> Configurar Profesor Virtual</h1>
            <p>Personaliza las respuestas y comportamiento del asistente de IA para tus estudiantes</p>
        `;
    }

    // Update AI tutor container
    const aiTutorContainer = aiTutorSection.querySelector('.ai-tutor-container');
    if (aiTutorContainer) {
        aiTutorContainer.innerHTML = `
            <div class="ai-tutor-config">
                <div class="config-section">
                    <h3>Configuración General</h3>
                    <form id="aiConfigForm" class="config-form">
                        <div class="form-group">
                            <label for="aiName">Nombre del Asistente</label>
                            <input type="text" id="aiName" class="form-control" value="Profesor Virtual" />
                        </div>
                        <div class="form-group">
                            <label for="aiPersonality">Personalidad</label>
                            <select id="aiPersonality" class="form-control">
                                <option value="friendly">Amigable y paciente</option>
                                <option value="formal">Formal y académico</option>
                                <option value="casual">Casual y relajado</option>
                                <option value="strict">Estricto y exigente</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="aiLanguage">Idioma principal</label>
                            <select id="aiLanguage" class="form-control">
                                <option value="es">Español</option>
                                <option value="en">Inglés</option>
                                <option value="fr">Francés</option>
                                <option value="de">Alemán</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar Configuración
                        </button>
                    </form>
                </div>

                <div class="config-section">
                    <h3>Respuestas Predefinidas</h3>
                    <div class="predefined-responses">
                        <div class="response-item">
                            <label>Pregunta de bienvenida</label>
                            <textarea class="form-control" rows="2">¡Hola! Soy tu profesor virtual. ¿En qué puedo ayudarte hoy con tus estudios de español?</textarea>
                        </div>
                        <div class="response-item">
                            <label>Respuesta de despedida</label>
                            <textarea class="form-control" rows="2">¡Hasta luego! Sigue practicando y no dudes en consultar cuando necesites ayuda.</textarea>
                        </div>
                        <div class="response-item">
                            <label>Respuesta para errores comunes</label>
                            <textarea class="form-control" rows="2">No te preocupes por los errores, son parte del aprendizaje. Vamos a corregirlo juntos.</textarea>
                        </div>
                    </div>
                </div>

                <div class="config-section">
                    <h3>Test de Configuración</h3>
                    <div class="test-chat">
                        <div class="chat-test">
                            <div class="test-message bot">
                                <div class="message-avatar">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="message-content">
                                    <p>¡Hola! Soy tu profesor virtual. ¿En qué puedo ayudarte hoy?</p>
                                </div>
                            </div>
                            <div class="test-input">
                                <input type="text" id="testInput" class="form-control" placeholder="Escribe una pregunta de prueba..." />
                                <button class="btn btn-primary" onclick="testAIResponse()">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup form handlers
    const aiConfigForm = document.getElementById('aiConfigForm');
    if (aiConfigForm) {
        aiConfigForm.addEventListener('submit', handleAIConfig);
    }
}

function handleAIConfig(e) {
    e.preventDefault();
    showAlert('Configuración del Profesor Virtual guardada', 'success');
}

function testAIResponse() {
    const testInput = document.getElementById('testInput');
    const testChat = document.querySelector('.test-chat');

    if (testInput && testChat) {
        const userMessage = testInput.value.trim();
        if (userMessage) {
            // Add user message
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'test-message user';
            userMsgDiv.innerHTML = `
                <div class="message-content">
                    <p>${userMessage}</p>
                </div>
            `;
            testChat.appendChild(userMsgDiv);

            // Simulate AI response
            setTimeout(() => {
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.className = 'test-message bot';
                aiMsgDiv.innerHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Esta es una respuesta de prueba del Profesor Virtual. La configuración real conectará con la API de IA.</p>
                    </div>
                `;
                testChat.appendChild(aiMsgDiv);

                // Clear input
                testInput.value = '';

                // Scroll to bottom
                testChat.scrollTop = testChat.scrollHeight;
            }, 1000);
        }
    }
}

// Helper functions
function showNewCourseModal() {
    showAlert('Función para crear nuevo curso próximamente', 'info');
}

function viewCourseStudents(courseId) {
    showSection('students');
    document.getElementById('courseFilter').value = courseId;
    filterStudents();
}

function viewCourseDetails(courseId) {
    showAlert(`Viendo detalles del curso ${courseId}`, 'info');
}

function filterStudents() {
    const courseFilter = document.getElementById('courseFilter');
    const selectedCourse = courseFilter.value;

    console.log('Filtering students by course:', selectedCourse);
    // This would filter the students list based on selected course
    loadStudents(); // For now, just reload all students
}

function printQR() {
    window.print();
}

function downloadQR() {
    showAlert('Función de descarga próximamente', 'info');
}

// Setup Navigation Event Listeners
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const logoutBtn = document.querySelector('.logout-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Exponer funciones globales necesarias
window.downloadResource = downloadResource;
window.logout = logout;
window.viewCourseStudents = viewCourseStudents;
window.viewCourseDetails = viewCourseDetails;
window.printQR = printQR;
window.downloadQR = downloadQR;
window.showSection = showSection;
window.testAIResponse = testAIResponse;
window.handleAIConfig = handleAIConfig;

// Setup navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
});

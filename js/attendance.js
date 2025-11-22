// Attendance System JavaScript
let html5QrCode = null;
let isScanning = false;

// Utility Functions
const notify = (type, text) => {
    if (window.showMessage) {
        window.showMessage(type, text);
    } else {
        console[type === 'error' ? 'error' : 'log'](text);
    }
};

const buildApiUrl = (path) => {
    if (window.APP_CONFIG && typeof window.APP_CONFIG.getApiUrl === 'function') {
        return window.APP_CONFIG.getApiUrl(path);
    }
    const base = 'http://localhost:3000';
    return `${base}${path}`;
};

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const isAuthenticated = () => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return token && user;
};

// Check authentication
const checkAuthentication = () => {
    if (!isAuthenticated()) {
        // Show login message instead of redirecting to avoid loop
        showLoginPrompt();
        return false;
    }
    return true;
};

// Show login prompt
const showLoginPrompt = () => {
    const scannerContainer = document.querySelector('.scanner-container');
    if (scannerContainer) {
        scannerContainer.innerHTML = `
            <div class="login-required">
                <i class="fas fa-user-lock"></i>
                <h3>Inicia sesión requerido</h3>
                <p>Para registrar tu asistencia, primero debes iniciar sesión en tu cuenta.</p>
                <div class="login-actions">
                    <a href="index.html#login" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </a>
                    <a href="index.html" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Volver al Inicio
                    </a>
                </div>
                <p class="login-note">
                    <small>¿No tienes cuenta? <a href="register.html">Regístrate aquí</a></small>
                </p>
            </div>
        `;
    }
};

// Modal Functions
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
};

const closeModal = () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
};

const showSuccessModal = (message, details = null) => {
    document.getElementById('successMessage').textContent = message;
    const detailsContainer = document.getElementById('attendanceDetails');

    if (details) {
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <span class="label">Curso:</span>
                <span class="value">${details.course_name}</span>
            </div>
            <div class="detail-row">
                <span class="label">Fecha:</span>
                <span class="value">${new Date(details.session_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Ubicación:</span>
                <span class="value">${details.location}</span>
            </div>
            <div class="detail-row">
                <span class="label">Método:</span>
                <span class="value">${details.verification_method === 'qr' ? 'Código QR' : 'Código Manual'}</span>
            </div>
        `;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.style.display = 'none';
    }

    showModal('successModal');
};

const showErrorModal = (message) => {
    document.getElementById('errorMessage').textContent = message;
    showModal('errorModal');
};

// Update scanner status
const updateScannerStatus = (status, message) => {
    const statusElement = document.getElementById('scannerStatus');
    const statusText = statusElement.querySelector('span');
    const statusIcon = statusElement.querySelector('i');

    statusElement.className = 'scanner-status';
    statusText.textContent = message;

    switch (status) {
        case 'scanning':
            statusElement.classList.add('scanning');
            statusIcon.className = 'fas fa-spinner fa-spin';
            break;
        case 'success':
            statusElement.classList.add('success');
            statusIcon.className = 'fas fa-check-circle';
            break;
        case 'error':
            statusElement.classList.add('error');
            statusIcon.className = 'fas fa-exclamation-circle';
            break;
        case 'ready':
            statusElement.classList.add('ready');
            statusIcon.className = 'fas fa-camera';
            break;
        case 'warning':
            statusElement.classList.add('warning');
            statusIcon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            statusIcon.className = 'fas fa-info-circle';
    }
};

// Camera permission
const requestCameraPermission = async () => {
    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        startQRScanner();
    } catch (error) {
        console.error('Camera permission denied:', error);
        showErrorModal('No se puede acceder a la cámara. Por favor, asegúrate de haber dado permiso para usar la cámara.');
    }
};

// QR Scanner Functions
const startQRScanner = async () => {
    try {
        if (!checkAuthentication()) return;

        // Check if already scanning
        if (isScanning) {
            console.log('Scanner already running');
            return;
        }

        // Check if Html5Qrcode library is available
        if (typeof Html5Qrcode === 'undefined') {
            // Fallback: show manual input dialog
            showManualInputFallback();
            return;
        }

        const qrReader = document.getElementById('qr-reader');
        qrReader.innerHTML = '<div class="loading-scanner"><i class="fas fa-spinner fa-spin"></i><p>Iniciando escáner...</p></div>';
        qrReader.classList.add('scanner-active');

        html5QrCode = new Html5Qrcode("qr-reader");

        updateScannerStatus('scanning', 'Iniciando escáner...');

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText, decodedResult) => {
                await handleQRScanned(decodedText);
            },
            (errorMessage) => {
                // QR scan failed, continue scanning
                console.log('QR scan failed:', errorMessage);
            }
        );

        isScanning = true;
        updateScannerStatus('scanning', 'Escaneando código QR...');

    } catch (error) {
        console.error('Error starting QR scanner:', error);
        updateScannerStatus('error', 'Error al iniciar el escáner');

        // Show fallback message
        showScannerFallback();
    }
};

// Show fallback when scanner fails
const showScannerFallback = () => {
    const qrReader = document.getElementById('qr-reader');
    qrReader.innerHTML = `
        <div class="scanner-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Escáner no disponible</h3>
            <p>El escáner QR no está disponible en este dispositivo o navegador.</p>
            <p><strong>Alternativas:</strong></p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>Usa el código manual debajo del escáner</li>
                <li>Asegúrate de tener HTTPS y permisos de cámara</li>
                <li>Intenta con un navegador compatible (Chrome, Firefox, Safari)</li>
            </ul>
            <button class="btn btn-secondary" onclick="showManualInput()">
                <i class="fas fa-keyboard"></i> Ingresar Código Manual
            </button>
        </div>
    `;
    qrReader.classList.remove('scanner-active');
};

// Show manual input fallback
const showManualInputFallback = () => {
    updateScannerStatus('error', 'Librería de escáner no disponible. Usa el código manual.');

    const qrReader = document.getElementById('qr-reader');
    qrReader.innerHTML = `
        <div class="scanner-placeholder">
            <i class="fas fa-keyboard"></i>
            <h3>Librería QR no disponible</h3>
            <p>Por favor, usa el formulario de código manual para registrar tu asistencia.</p>
            <button class="btn btn-primary" onclick="scrollToManual()">
                <i class="fas fa-arrow-down"></i> Ir al Código Manual
            </button>
        </div>
    `;
    qrReader.classList.remove('scanner-active');
};

// Scroll to manual input
const scrollToManual = () => {
    const manualSection = document.querySelector('.manual-section');
    if (manualSection) {
        manualSection.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('attendanceCode').focus();
    }
};

const stopQRScanner = async () => {
    try {
        if (html5QrCode && isScanning) {
            await html5QrCode.stop();
            isScanning = false;
            updateScannerStatus('success', 'Escáner detenido');

            const qrReader = document.getElementById('qr-reader');
            qrReader.classList.remove('scanner-active');
        }
    } catch (error) {
        console.error('Error stopping QR scanner:', error);
    }
};

// Handle QR Scanned
const handleQRScanned = async (qrCodeText) => {
    try {
        updateScannerStatus('scanning', 'Validando código QR...');

        await stopQRScanner();

        const response = await fetch(buildApiUrl('/api/attendance/qr/validate'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ qr_code: qrCodeText })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al validar QR');
        }

        updateScannerStatus('success', 'Asistencia registrada');
        showSuccessModal(result.message, result.data);

        // Refresh attendance list
        refreshAttendance();

    } catch (error) {
        console.error('Error handling QR scan:', error);
        updateScannerStatus('error', error.message);
        showErrorModal(error.message);

        // Restart scanner after error
        setTimeout(() => {
            startQRScanner();
        }, 3000);
    }
};

// Manual Code Submission
const handleManualCode = async (e) => {
    e.preventDefault();

    if (!checkAuthentication()) return;

    const codeInput = document.getElementById('attendanceCode');
    const submitBtn = document.getElementById('submitCodeBtn');

    const code = codeInput.value.trim();

    if (!code) {
        showErrorModal('Por favor, ingresa un código de asistencia');
        return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    try {
        const response = await fetch(buildApiUrl('/api/attendance/code/validate'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ code })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al validar código');
        }

        showSuccessModal(result.message, result.data);

        // Clear form
        codeInput.value = '';

        // Refresh attendance list
        refreshAttendance();

    } catch (error) {
        console.error('Error handling manual code:', error);
        showErrorModal(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
};

// Load attendance records
const loadAttendance = async () => {
    try {
        if (!checkAuthentication()) return;

        const attendanceList = document.getElementById('attendanceList');
        attendanceList.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando asistencias...</p>
            </div>
        `;

        const response = await fetch(buildApiUrl('/api/attendance/my-attendance?limit=10'), {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al cargar asistencias');
        }

        displayAttendance(result.data);

    } catch (error) {
        console.error('Error loading attendance:', error);
        const attendanceList = document.getElementById('attendanceList');
        attendanceList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar las asistencias</p>
                <button class="btn btn-secondary btn-sm" onclick="refreshAttendance()">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
    }
};

const displayAttendance = (attendanceData) => {
    const attendanceList = document.getElementById('attendanceList');

    if (!attendanceData || attendanceData.length === 0) {
        attendanceList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>No tienes registros de asistencia</p>
                <p class="small-text">Usa el escáner QR o ingresa un código manual para registrar tu primera asistencia</p>
            </div>
        `;
        return;
    }

    const attendanceHTML = attendanceData.map(record => {
        const date = new Date(record.created_at);
        const formattedDate = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="attendance-item">
                <div class="date">${formattedDate}</div>
                <div class="course">${record.course_name}</div>
                <div class="details">
                    <span><i class="fas fa-clock"></i> ${formattedTime}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${record.location}</span>
                    <span><i class="fas fa-qrcode"></i> ${record.verification_method === 'qr' ? 'QR' : 'Manual'}</span>
                </div>
            </div>
        `;
    }).join('');

    attendanceList.innerHTML = attendanceHTML;
};

const refreshAttendance = () => {
    loadAttendance();
};

// Fill test code for demo
const fillTestCode = () => {
    const codeInput = document.getElementById('attendanceCode');
    if (codeInput) {
        codeInput.value = 'DEMO-CODE-123';
        codeInput.focus();
    }
};

// Initialize scanner button and UI
const initializeScannerUI = () => {
    // Don't auto-start scanner - wait for user interaction
    updateScannerStatus('ready', 'Presiona "Iniciar Escáner" para comenzar');

    // Check if Html5Qrcode library is available and show appropriate message
    if (typeof Html5Qrcode === 'undefined') {
        updateScannerStatus('warning', 'Librería QR no disponible - usa código manual');
        console.log('Html5Qrcode library not loaded');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    // Load QR library if not loaded
    if (typeof Html5Qrcode === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js';
        script.onload = () => {
            console.log('QR Library loaded successfully');
            initializeScannerUI();
        };
        script.onerror = () => {
            console.warn('QR Library failed to load');
            initializeScannerUI();
        };
        document.head.appendChild(script);
    } else {
        initializeScannerUI();
    }

    // Setup manual code form
    const manualForm = document.getElementById('manualCodeForm');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualCode);
    }

    // Load attendance records
    loadAttendance();

    // Handle window visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopQRScanner();
        } else if (isAuthenticated()) {
            startQRScanner();
        }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
        stopQRScanner();
    });

    // Modal close handlers
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Add keyboard shortcut for camera activation
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            requestCameraPermission();
        }
    });
});
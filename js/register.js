// Registration Form Handler

let currentStep = 1;
const totalSteps = 3;

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

// Form validation rules
const validationRules = {
    firstName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'El nombre debe contener solo letras'
    },
    lastName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Los apellidos deben contener solo letras'
    },
    phone: {
        required: true,
        pattern: /^\+?[\d\s-()]+$/,
        message: 'Formato de teléfono inválido'
    },
    country: {
        required: true,
        message: 'Selecciona tu país'
    },
    birthDate: {
        required: true,
        custom: validateAge,
        message: 'Debes tener al menos 16 años'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Correo electrónico inválido'
    },
    password: {
        required: true,
        minLength: 8,
        custom: validatePassword,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo'
    },
    confirmPassword: {
        required: true,
        custom: validatePasswordMatch,
        message: 'Las contraseñas no coinciden'
    },
    spanishLevel: {
        required: true,
        message: 'Selecciona tu nivel de español'
    },
    startDate: {
        required: true,
        custom: validateStartDate,
        message: 'La fecha de inicio debe ser futura'
    },
    terms: {
        required: true,
        message: 'Debes aceptar los términos y condiciones'
    }
};

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    // Set minimum dates
    setDateLimits();

    // Add real-time validation
    addRealTimeValidation();

    // Handle form submission
    form.addEventListener('submit', handleSubmit);

    // Password strength indicator
    document.getElementById('password').addEventListener('input', updatePasswordStrength);
});

// Navigation functions
function nextStep(step) {
    console.log('nextStep called with step:', step);

    if (validateStep(step)) {
        console.log('Validation passed, moving to next step');
        // Mark current step as completed
        document.querySelector(`.step[data-step="${step}"]`).classList.add('completed');

        // Hide current step
        document.getElementById(`step${step}`).classList.remove('active');

        // Show next step
        currentStep = step + 1;
        document.getElementById(`step${currentStep}`).classList.add('active');

        // Update progress
        document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.log('Validation failed for step:', step);
        notify('error', 'Por favor, completa todos los campos obligatorios correctamente');
    }
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${step}`).classList.remove('active');

    // Show previous step
    currentStep = step - 1;
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Update progress
    document.querySelector(`.step[data-step="${step}"]`).classList.remove('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation functions
function validateStep(step) {
    console.log('validateStep called for step:', step);
    const stepElement = document.getElementById(`step${step}`);

    if (!stepElement) {
        console.error('Step element not found:', `step${step}`);
        return false;
    }

    const inputs = stepElement.querySelectorAll('input, select');
    console.log('Found inputs:', inputs.length);
    let isValid = true;
    let invalidFields = [];

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
            invalidFields.push(input.name || input.id);
        }
    });

    if (!isValid) {
        console.log('Invalid fields:', invalidFields);
    }

    return isValid;
}

function validateField(field) {
    const fieldName = field.name;
    const rules = validationRules[fieldName];

    if (!rules) {
        console.log('No validation rules for:', fieldName);
        return true;
    }

    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');

    // Clear previous error
    field.classList.remove('error', 'success');
    if (errorElement) {
        errorElement.classList.remove('show');
    }

    // Required validation
    if (rules.required) {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                showError(field, rules.message);
                return false;
            }
        } else if (!value) {
            showError(field, 'Este campo es obligatorio');
            return false;
        }
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
        return true;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
        showError(field, `Debe tener al menos ${rules.minLength} caracteres`);
        return false;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
        showError(field, rules.message);
        return false;
    }

    // Custom validation
    if (rules.custom && !rules.custom(field)) {
        showError(field, rules.message);
        return false;
    }

    // Field is valid
    field.classList.add('success');
    return true;
}

function showError(field, message) {
    console.log('showError:', field.name || field.id, '-', message);
    field.classList.add('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    } else {
        console.warn('No error element found for field:', field.name || field.id);
    }
}

// Custom validation functions
function validateAge(field) {
    const birthDate = new Date(field.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 16;
}

function validatePassword(field) {
    const password = field.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= 8 && hasUpperCase && hasNumber && hasSymbol;
}

function validatePasswordMatch(field) {
    const password = document.getElementById('password').value;
    const confirmPassword = field.value;

    return password === confirmPassword;
}

function validateStartDate(field) {
    const startDate = new Date(field.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return startDate > today;
}

// Real-time validation
function addRealTimeValidation() {
    const form = document.getElementById('registerForm');
    const inputs = form.querySelectorAll('input, select');

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value) {
                validateField(input);
            }
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

// Password strength indicator
function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.querySelector('.strength-bar');

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    strengthBar.className = 'strength-bar';

    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentElement.querySelector('.toggle-password i');

    if (field.type === 'password') {
        field.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

// Set date limits
function setDateLimits() {
    const birthDateInput = document.getElementById('birthDate');
    const startDateInput = document.getElementById('startDate');
    const today = new Date();

    // Birth date: must be at least 16 years ago
    const maxBirthDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    birthDateInput.max = maxBirthDate.toISOString().split('T')[0];

    // Start date: must be in the future
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDateInput.min = tomorrow.toISOString().split('T')[0];
}

// Form submission
async function handleSubmit(e) {
    e.preventDefault();

    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
            allValid = false;
            // Go back to first invalid step
            if (currentStep !== i) {
                currentStep = i;
                document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
                document.getElementById(`step${i}`).classList.add('active');
                document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
                document.querySelector(`.step[data-step="${i}"]`).classList.add('active');
            }
            break;
        }
    }

    if (!allValid) {
        notify('error', 'Por favor, completa todos los campos correctamente');
        return;
    }

    // Check if backend is configured
    if (window.APP_CONFIG && !window.APP_CONFIG.hasBackend) {
        notify('error', 'El formulario no puede funcionar desde GitHub Pages sin una API configurada. Por favor, usa la versión local o configura una API en producción.');
        console.error('❌ No backend configured. To fix this:');
        console.error('1. Para desarrollo local: Abre el sitio desde http://localhost:8080');
        console.error('2. Para producción: Agrega <meta name="api-base-url" content="https://tu-api.com"> en el HTML');
        return;
    }

    // Gather form data
    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData.entries());

    const data = {
        ...rawData,
        newsletter: rawData.newsletter ? rawData.newsletter === 'on' : false
    };

    delete data.confirmPassword;
    delete data.terms;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        // Send to backend API
        const apiUrl = buildApiUrl('/api/auth/register');
        console.log('Sending request to:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        const payload = isJsonResponse ? await response.json() : await response.text();

        if (!response.ok) {
            const serverMessage = isJsonResponse && payload && typeof payload === 'object'
                ? payload.message
                : '';
            const errorMessage = serverMessage || `Error al registrar usuario (HTTP ${response.status})`;

            if (!serverMessage && typeof payload === 'string') {
                console.error('Respuesta inesperada del servidor:', payload);
            }

            throw new Error(errorMessage);
        }

        if (!isJsonResponse || !payload || typeof payload !== 'object') {
            throw new Error('Respuesta inesperada del servidor. Verifica la URL de la API y vuelve a intentarlo.');
        }

        const result = payload;

        // Store token in localStorage
        if (result.data && result.data.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }

        // Show success message
        document.getElementById('registeredEmail').textContent = data.email;
        document.querySelector('.register-form').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 3000);

    } catch (error) {
        console.error('Registration error:', error);
        notify('error', error.message);

        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

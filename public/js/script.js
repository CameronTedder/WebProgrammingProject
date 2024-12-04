// Helper function to display error messages
function showError(element, message) {
    const errorElement = element.nextElementSibling; // Error message container
    errorElement.textContent = message;
    errorElement.style.color = "red";
}

// Helper function to clear error messages
function clearError(element) {
    const errorElement = element.nextElementSibling;
    errorElement.textContent = "";
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password (min 6 characters, at least one number)
function isValidPassword(password) {
    return password.length >= 6 && /\d/.test(password);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const loginButton = document.getElementById('show-login');
    const registerButton = document.getElementById('show-register');

    // Show Login Form by Default
    loginButton.addEventListener('click', () => {
        loginContainer.classList.add('active');
        registerContainer.classList.remove('active');
        loginButton.classList.add('active');
        registerButton.classList.remove('active');
    });

    // Show Register Form
    registerButton.addEventListener('click', () => {
        registerContainer.classList.add('active');
        loginContainer.classList.remove('active');
        registerButton.classList.add('active');
        loginButton.classList.remove('active');
    });
});

// Register Form Validation
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const firstname = document.getElementById('register-firstname');
    const lastname = document.getElementById('register-lastname');
    const email = document.getElementById('register-email');
    const password = document.getElementById('register-password');

    let isValid = true; // Flag to track form validity

    // First name validation
    if (firstname.value.trim() === "") {
        showError(firstname, "First name cannot be empty.");
        isValid = false;
    } else {
        clearError(firstname);
    }

    // Last name validation
    if (lastname.value.trim() === "") {
        showError(lastname, "Last name cannot be empty.");
        isValid = false;
    } else {
        clearError(lastname);
    }

    // Email validation
    if (!isValidEmail(email.value)) {
        showError(email, "Enter a valid email address.");
        isValid = false;
    } else {
        clearError(email);
    }

    // Password validation
    if (!isValidPassword(password.value)) {
        showError(password, "Password must be at least 6 characters and contain a number.");
        isValid = false;
    } else {
        clearError(password);
    }

    // If the form is valid, send data to the server
    if (isValid) {
        const res = await fetch('/api/routes/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstname: firstname.value,
                lastname: lastname.value,
                email: email.value,
                password: password.value,
            }),
        });

        const data = await res.json();
        alert(data.message);
    }
});

// Login Form Validation
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');

    let isValid = true; // Flag to track form validity

    // Email validation
    if (!isValidEmail(email.value)) {
        showError(email, "Enter a valid email address.");
        isValid = false;
    } else {
        clearError(email);
    }

    // Password validation
    if (!isValidPassword(password.value)) {
        showError(password, "Password must be at least 6 characters and contain a number.");
        isValid = false;
    } else {
        clearError(password);
    }

    // If the form is valid, send data to the server
    if (isValid) {
        const res = await fetch('/api/routes/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
            }),
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);

            window.location.href = "profile.html";
        } else {
            alert(data.error);
        }
    }
});
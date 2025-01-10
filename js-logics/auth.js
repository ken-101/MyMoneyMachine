// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const signOutButton = document.getElementById('signOutButton');

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show error function with red background
    function showError(message) {
        console.error(message);
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.backgroundColor = '#ffebee';
        errorMessage.style.padding = '10px';
        errorMessage.style.borderRadius = '4px';
        errorMessage.style.marginBottom = '10px';
    }

    // Clear error function
    function clearError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    // Add input event listeners for real-time validation
    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        if (email && !isValidEmail(email)) {
            emailInput.style.borderColor = 'red';
            showError('Please enter a valid email (e.g., user@example.com)');
        } else {
            emailInput.style.borderColor = '';
            clearError();
        }
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password && password.length < 4) {
            passwordInput.style.borderColor = 'red';
            showError('Password must be at least 4 characters long');
        } else {
            passwordInput.style.borderColor = '';
            clearError();
        }
    });

    // Sign Up
    if (signUpButton) {
        signUpButton.addEventListener('click', async () => {
            clearError();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate inputs
            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email (e.g., user@example.com)');
                return;
            }

            if (password.length < 4) {
                showError('Password must be at least 4 characters long');
                return;
            }

            try {
                // Show loading state
                signUpButton.disabled = true;
                signUpButton.textContent = 'Creating Account...';

                console.log('Attempting to create account with:', email);
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                console.log('Account created successfully:', userCredential.user.email);

                // Create user document in Firestore
                await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    totalMoney: 0
                });

                console.log('User document created in Firestore');
                // Redirect will be handled by onAuthStateChanged
            } catch (error) {
                console.error('Sign up error:', error);
                if (error.code === 'auth/email-already-in-use') {
                    showError('This email is already registered. Please sign in instead.');
                } else if (error.code === 'auth/invalid-email') {
                    showError('Please enter a valid email (e.g., user@example.com)');
                } else if (error.code === 'auth/weak-password') {
                    showError('Password is too weak. Please use at least 4 characters.');
                } else {
                    showError(error.message);
                }
            } finally {
                // Reset button state
                signUpButton.disabled = false;
                signUpButton.textContent = 'Create New Account';
            }
        });
    }

    // Sign In
    if (signInButton) {
        signInButton.addEventListener('click', async () => {
            clearError();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate inputs
            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }

            if (!isValidEmail(email)) {
                showError('Please enter a valid email (e.g., user@example.com)');
                return;
            }

            try {
                // Show loading state
                signInButton.disabled = true;
                signInButton.textContent = 'Signing In...';

                console.log('Attempting to sign in with:', email);
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                console.log('Sign in successful:', userCredential.user.email);
                // Redirect will be handled by onAuthStateChanged
            } catch (error) {
                console.error('Sign in error:', error);
                if (error.code === 'auth/user-not-found') {
                    showError('No account found with this email. Please sign up first.');
                } else if (error.code === 'auth/wrong-password') {
                    showError('Incorrect password. Please try again.');
                } else {
                    showError(error.message);
                }
            } finally {
                // Reset button state
                signInButton.disabled = false;
                signInButton.textContent = 'Sign In';
            }
        });
    }

    // Sign Out functionality
    function signOutUser() {
        firebase.auth().signOut().then(() => {
            console.log("User has been logged out.");
            window.location.href = 'index.html'; // Redirect to login page
        }).catch((error) => {
            console.error("Sign out error:", error);
            alert("Error signing out: " + error.message);
        });
    }

    // Add sign-out event listener if the button exists
    if (signOutButton) {
        signOutButton.addEventListener("click", signOutUser);
    } else {
        console.warn("Sign out button not found on this page.")
    }

    // Auth state observer
    firebase.auth().onAuthStateChanged((user) => {
        console.log("Auth state changed. User:", user ? user.email : 'signed out');
        
        if (user) {
            // User is signed in
            const currentPath = window.location.pathname.toLowerCase();
            if (currentPath.endsWith('index.html') || currentPath === '/') {
                window.location.href = 'home.html';
            } else {
                // Update UI for home page
                const userEmail = document.getElementById('userEmail');
                if (userEmail) {
                    userEmail.textContent = user.email;
                }
            }
        } else {
            // User is signed out
            const currentPath = window.location.pathname.toLowerCase();
            if (!currentPath.endsWith('index.html') && currentPath !== '/') {
                window.location.href = 'index.html';
            }
        }
    });
});

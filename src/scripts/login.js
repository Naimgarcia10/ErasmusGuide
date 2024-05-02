import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {signInWithEmailAndPassword, getAuth, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js"; 
import { isCoordinator } from "./usersManagement.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();
const auth = getAuth(app);

// Obtén el formulario de inicio de sesión
const loginForm = document.getElementById('login-form');

// Manejar el evento submit del formulario
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  loginUser();
});

const reset_password = document.getElementById('reset-password');
reset_password.addEventListener('click', async (e) => {
    e.preventDefault();
    loginUser(); 
});

async function loginUser(){
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    const temporaryMessage = document.getElementById('temporary-message-login');
    
    // Inicia sesión
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        // Limpiar el formulario
        loginForm.reset();
        temporaryMessage.textContent = 'Inicio de sesión exitoso';
        sessionStorage.setItem('user', JSON.stringify(userCredential.user));
        isCoordinator(email);
        setTimeout(function() {
        temporaryMessage.textContent = '';
        location.href = 'search_destination.html';
        }, 3000);
    }).catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/user-not-found') {
            temporaryMessage.textContent = 'El usuario no existe';
            } else if (errorCode === 'auth/wrong-password') {
            temporaryMessage.textContent = 'La contraseña es incorrecta';
            } else if (errorCode === 'auth/invalid-email') {
            temporaryMessage.textContent = 'El correo no es válido';
            } else if (errorCode === 'auth/invalid-login-credentials') {
            temporaryMessage.textContent = 'Las credenciales no son válidas';
            } else {
            temporaryMessage.textContent = error.message;
            }
    });
    }

    async function logoutUser(){
        auth.signOut().then(() => {
            sessionStorage.removeItem('user');
            location.href = 'index.html';
        }).catch((error) => {
            console.error(error);
        });
    }

    async function resetPassword(){
        /*const email = loginForm['email'].value;
        const temporaryMessage = document.getElementById('temporary-message-login');

        if (email === '') {
            temporaryMessage.textContent = 'Por favor, ingrese su correo electrónico';
            return;
        }

        sendPasswordResetEmail(auth, email).then(() => {
            temporaryMessage.textContent = 'Correo de restablecimiento de contraseña enviado';
            setTimeout(function() {
                temporaryMessage.textContent = '';
                }, 5000);
        }).catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/user-not-found') {
                temporaryMessage.textContent = 'El usuario no existe';
            } else if (errorCode === 'auth/invalid-email') {
                temporaryMessage.textContent = 'El correo no es válido';
            } else {
                temporaryMessage.textContent = error.message;
            }
        });*/
    }



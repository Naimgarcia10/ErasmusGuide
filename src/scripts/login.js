import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {signInWithEmailAndPassword, getAuth} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
        setTimeout(function() {
        temporaryMessage.textContent = '';
        location.href = 'pruebas.html';
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
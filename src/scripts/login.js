import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {signInWithEmailAndPassword, getAuth, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js"; 
import { isCoordinator } from "./usersManagement.js";


const { app, db } = initializeFirebase();
const auth = getAuth(app);


const loginForm = document.getElementById('login-form');


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  loginUser();
});

const reset_password = document.getElementById('reset-password');
reset_password.addEventListener('click', async (e) => {
    e.preventDefault();
    resetPassword(); 
});

async function loginUser(){
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    const temporaryMessage = document.getElementById('temporary-message-login');
    
    
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        
        loginForm.reset();
        temporaryMessage.textContent = 'Inicio de sesión exitoso';
        sessionStorage.setItem('user', JSON.stringify(userCredential.user));
        isCoordinator(email);
        setTimeout(function() {
        temporaryMessage.textContent = '';
        location.href = 'index.html';
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

    async function resetPassword(){
        const email = loginForm['email'].value;
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
        });
    }
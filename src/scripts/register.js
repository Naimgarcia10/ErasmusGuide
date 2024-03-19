import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {createUserWithEmailAndPassword, getAuth, sendEmailVerification} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();
const auth = getAuth(app);

// Obtén el formulario de registro
const registerForm = document.getElementById('register-form');

// Manejar el evento submit del formulario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  registerUser();
});

async function registerUser(){
  const email = registerForm['email'].value;
  const password = registerForm['password'].value;
  const password2 = registerForm['password2'].value;
  const temporaryMessage = document.getElementById('temporary-message-register');

  // Verifica que las contraseñas coincidan
  if (password !== password2) {
    temporaryMessage.textContent = 'Las contraseñas no coinciden';
    return;
  }

  // Crea el usuario
  createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
    // Limpiar el formulario
    registerForm.reset();
    auth.signOut(); 
    sendEmailVerification(auth.currentUser).then(() => {
    temporaryMessage.textContent = 'Usuario creado con éxito. Por favor, verifica tu correo electrónico para continuar';
    });
    setTimeout(function() {
      temporaryMessage.textContent = '';
      location.href = 'login.html';
    }, 5000);
  }).catch((error) => {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      temporaryMessage.textContent = 'El correo ya está en uso';
    } else if (errorCode === 'auth/invalid-email') {
      temporaryMessage.textContent = 'El correo no es válido';
    } else if (errorCode === 'auth/weak-password') {
      temporaryMessage.textContent = 'La contraseña debe tener al menos 6 caracteres';
    } else {
      temporaryMessage.textContent = temporaryMessage.message;
    }
  });
}

async function deleteUnverifiedUsers() {
  
}

export { deleteUnverifiedUsers };

setTimeout(deleteUnverifiedUsers, 10000);



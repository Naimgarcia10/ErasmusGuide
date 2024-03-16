import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {createUserWithEmailAndPassword, getAuth, sendEmailVerification} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();
const auth = getAuth(app);

// Obtén el formulario de registro
const registerForm = document.getElementById('register-form');

// Manejar el evento submit del formulario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evitar que el formulario se envíe

  // Obtén los datos del formulario
  const email = registerForm['email'].value;
  const password = registerForm['password'].value;
  const password2 = registerForm['password2'].value;

  // Verifica que las contraseñas coincidan
  if (password !== password2) {
    alert('Las contraseñas no coinciden!');
    return;
  }

  // Crea el usuario
  createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
    // Limpiar el formulario
    registerForm.reset();
    alert('Usuario creado con éxito!');
    auth.signOut(); 
    sendEmailVerification(auth.currentUser).then(() => {
      alert('Se ha enviado un correo de verificación');
    });
  }).catch((error) => {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      alert('El correo ya está en uso');
    } else if (errorCode === 'auth/invalid-email') {
      alert('El correo no es válido');
    } else if (errorCode === 'auth/weak-password') {
      alert('La contraseña debe tener al menos 6 caracteres');
    } else {
      alert('Error desconocido');
    }
  });
});

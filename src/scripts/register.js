import {createUserWithEmailAndPassword, getAuth, sendEmailVerification} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {initializeFirebase} from "../firebase/firebaseConnection.js";
import { getUsers, addUser } from "./usersManagement.js";
// Inicializa Firebase
const { app, db } = initializeFirebase();
const auth = getAuth(app);

// Obtén el formulario de registro
const registerForm = document.getElementById('register-form');

// Manejar el evento submit del formulario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  registerUser()
  .then(userData => {
    addUser(userData[0], userData[1]);
  })
  .catch(error => {
    console.error(error);
  });
  
  
});


async function registerUser(){
  const email = registerForm['email'].value;
  const password = registerForm['password'].value;
  const password2 = registerForm['password2'].value;
  const temporaryMessage = document.getElementById('temporary-message-register');

  // Verifica que las contraseñas coincidan
  if (password !== password2) {
    temporaryMessage.textContent = 'Las contraseñas no coinciden';
    return Promise.reject('Las contraseñas no coinciden');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Limpiar el formulario
    registerForm.reset();
    auth.signOut();

    const userData = [userCredential.user.uid, email];
    console.log(userData);

    await sendEmailVerification(auth.currentUser);
    temporaryMessage.textContent = 'Usuario creado con éxito. Por favor, verifica tu correo electrónico para continuar';
    setTimeout(function() {
      temporaryMessage.textContent = '';
      location.href = 'login.html';
    }, 3000);
    return userData;
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      temporaryMessage.textContent = 'El correo ya está en uso';
    } else if (errorCode === 'auth/invalid-email') {
      temporaryMessage.textContent = 'El correo no es válido';
    } else if (errorCode === 'auth/weak-password') {
      temporaryMessage.textContent = 'La contraseña debe tener al menos 6 caracteres';
    } else {
      temporaryMessage.textContent = error.message;
    }

    return Promise.reject(error);
  }
}



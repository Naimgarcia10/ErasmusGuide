import {initializeFirebase} from "../firebase/firebaseConnection.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {doc, getDoc, getDocs, collection, setDoc, addDoc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
// Inicializa Firebase
const { app, db } = initializeFirebase();
const auth = getAuth(app);

async function getUsers() {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    querySnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        data: doc.data()
      });
    });
  
    console.log("All users:", users);
  
    return users;
  }

  async function isCoordinator(email) {
    const coords = ["sri.eii@admulpgc.es"]
    if (coords.includes(email)){
      sessionStorage.setItem('role', 'coordinator');
      console.log("Es coordinador");
      //return true;
    } else {
      sessionStorage.setItem('role', 'user');
      console.log("No es coordinador");
      //return false;
    }
  }


async function addUser(userID, userEmail){
  try {
    console.log(userEmail);
    await setDoc(doc(db, "users", userID), {
      email: userEmail
    });
    console.log("Usuario creado con éxito. ID: ", userID);
  } catch (error) {
    console.error("Error al crear el usuario: ", error);
  }
}

async function getFirestoreUsers() {
  const docRef = doc(db, "users");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}

async function logoutUser(){
  auth.signOut().then(() => {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      location.href = 'index.html';
  }).catch((error) => {
      console.error(error);
  });
}
  
  
  
  
export { getUsers, addUser, getFirestoreUsers, isCoordinator, logoutUser };

import { initializeFirebase } from "../firebase/firebaseConnection.js";

// Inicializa Firebase
const {db} = initializeFirebase();

// Obtén el formulario de crear asignatura
const AddSubjectForm = document.getElementById('form-group');

// Manejar el evento submit del formulario
AddSubjectForm.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  addSubject();
});
async function addSubject(){
    const subject = AddSubjectForm['subject'].value;
    const idSubject = AddSubjectForm['idSubject'].value;
    const credits = AddSubjectForm['credits'].value;
    createSubject(subject, idSubject, credits);
}

//crea la asigantura
function createSubject(subject, idSubject, credits){
    AddSubjectForm.reset();
    db.collection("subjects").add({
        subject: subject,
        idSubject: idSubject,
        credits: credits
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}




// Obtén referencia al botón "Remove" por su ID
const btnRemove = document.getElementById('btn-remove');

// Agrega un event listener para el evento 'click' al botón
btnRemove.addEventListener('click', function() {
    // Obten el valor del ID de la asignatura a eliminar
    const idSubjectToRemove = document.getElementById('idSubjectRemove').value;

    // Llama a la función para eliminar la asignatura pasando el ID como argumento
    deleteSubject(idSubjectToRemove);
});

  // Función para eliminar una asignatura por su ID
async function deleteSubject(idSubject) {
    try {
        await db.collection("subjects").doc(idSubject).delete();
        console.log("Subject deleted successfully.");
    } catch (error) {
        console.error("Error deleting subject:", error);
    }
}




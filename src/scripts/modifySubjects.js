import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
// Inicializa Firebase
const {db} = initializeFirebase();

// Obtén el formulario de crear asignatura
const AddSubjectForm = document.getElementById('form-create');

// Manejar el evento submit del formulario
document.getElementById('btn-create').addEventListener('click', async (e) => {
  e.preventDefault(); 
  await addSubject();
});

async function addSubject(){
    const grade = AddSubjectForm['grade'].value;
    const country = AddSubjectForm['country'].value;
    const city = AddSubjectForm['city'].value;
    const university = AddSubjectForm['university'].value;

    const docId = doc(db, 'Grados', grade, country, city, university, 'Asignaturas');

    const newSubject = {
    origin_subject : AddSubjectForm['origin_subject'].value,
    id_origin_subject : AddSubjectForm['id_origin_subject'].value,
    origin_credits : parseInt(AddSubjectForm['origin_credits'].value),
    destination_subject : AddSubjectForm['destination_subject'].value,
    id_destination_subject : AddSubjectForm['id_destination_subject'].value,
    destination_credits : parseInt(AddSubjectForm['destination_credits'].value),
    semester : AddSubjectForm['semester'].value,
    id_pair : AddSubjectForm['id_pair'].value
    };

    const docRef = doc(db, 'Asignaturas', docId);
    try{
      await updateDoc(docRef, {
        Asignaturas: arrayUnion(newSubject)
      });
      console.log('Subject added successfully');
    } catch(error){
      console.error('Error adding the subject:', error);
    }
}




/*crea la asigantura
function createSubject(grade, country, city, university,
    origin_subject, id_origin_subject, origin_credits,
    destination_subject, id_destination_subject, destination_credits,
    semester, id_pair){
    AddSubjectForm.reset();
    // Obtener una referencia a la colección de asignaturas
    const asignaturasRef = db.collection('asignaturas')
    .doc(grade)
    .collection(country)
    .doc(city)
    .collection(university)
    .doc('Asignaturas');

    // Crear un objeto con los datos de la asignatura
    const subjectData = {
    Nombre: origin_subject,
    ConvalidacionErasmus: destination_subject,
    code_origin: id_origin_subject,
    code_destiny: id_destination_subject,
    code_pair: id_pair,
    ects_origin: origin_credits,
    ects_destiny: destination_credits,
    semester: semester
    };

    asignaturasRef.add(subjectData)
    .then(docRef => {
      console.log("Subject added successfully:", docRef.id);
    })
    .catch(error => {
      console.error("Error adding the subject:", error);
    });
}*/




async function removeAssignmentsByCode() {
  const codeToRemove = document.getElementById('codeToRemove').value; // Asume que tienes un input con este ID.
  const gradosRef = doc(document, 'asignaturas', 'Grados'); // Referencia al documento que contiene los grados.

  try {
      const gradosSnap = await getDoc(gradosRef);

      if (gradosSnap.exists()) {
          let data = gradosSnap.data(); // Obtiene los datos actuales.

          // Aquí necesitas definir cómo iterar sobre tus datos y filtrar las asignaturas.
          // Este es un pseudocódigo que deberás ajustar según tu estructura exacta.
          Object.keys(data).forEach(gradoKey => {
              Object.keys(data[gradoKey]).forEach(paisKey => {
                  Object.keys(data[gradoKey][paisKey]).forEach(ciudadKey => {
                      Object.keys(data[gradoKey][paisKey][ciudadKey]).forEach(universidadKey => {
                          let asignaturas = data[gradoKey][paisKey][ciudadKey][universidadKey].Asignaturas;
                          let asignaturasFiltradas = asignaturas.filter(asignatura => 
                              asignatura.code_origin !== codeToRemove && 
                              asignatura.code_destiny !== codeToRemove
                          );
                          // Actualiza las asignaturas filtradas.
                          data[gradoKey][paisKey][ciudadKey][universidadKey].Asignaturas = asignaturasFiltradas;
                      });
                  });
              });
          });

          // Finalmente, actualiza el documento en Firestore con los datos filtrados.
          await updateDoc(gradosRef, data);
          console.log('Asignaturas actualizadas en Firestore.');
      }
  } catch (error) {
      console.error("Error al intentar eliminar asignaturas por código:", error);
  }
}

document.getElementById('removeButton').addEventListener('click', removeAssignmentsByCode);

/*<input type="text" id="codeToRemove" placeholder="Código de asignatura a eliminar">
<button id="removeButton">Eliminar Asignaturas</button>*/ 





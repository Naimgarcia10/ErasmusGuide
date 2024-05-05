import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
// Inicializa Firebase
const { app, db } = initializeFirebase();

// Obtén el formulario de crear asignatura
const AddSubjectForm = document.getElementById("form-create");

// Manejar el evento submit del formulario
document.getElementById("btn-create").addEventListener("click", async (e) => {
  e.preventDefault();
  await addSubject();
});

async function addSubject() {
  const grade = AddSubjectForm["grade"].value;
  const country = AddSubjectForm["country"].value;
  const city = AddSubjectForm["city"].value;
  const university = AddSubjectForm["university"].value;

  // La ruta al documento que contiene las asignaturas
  const gradosRef = doc(db, "asignaturas", "Grados"); // Referencia al documento que contiene los grados.

  const newSubject = {
    Nombre: AddSubjectForm["origin_subject"].value,
    ConvalidacionErasmus: AddSubjectForm["destination_subject"].value,
    code_origin: AddSubjectForm["id_origin_subject"].value,
    origin_credits: parseInt(AddSubjectForm["origin_credits"].value),
    code_destiny: AddSubjectForm["id_destination_subject"].value,
    destination_credits: parseInt(AddSubjectForm["destination_credits"].value),
    semester: AddSubjectForm["semester"].value,
    code_pair: AddSubjectForm["id_pair"].value,
  };

  try {
    // Leer el documento existente
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      // Utiliza la función de Firebase para actualizar campos anidados

      let gradosData = gradosSnap.data();
      // Comprobar si el grado especificado existe
      if (!(grade in gradosData)) {
        // Si no existe, inicializar la estructura para ese grado
        gradosData[grade] = {};
      }
      if (!(country in gradosData[grade])) {
        gradosData[grade][country] = {};
      }
      if (!(city in gradosData[grade][country])) {
        gradosData[grade][country][city] = {};
      }
      if (!(university in gradosData[grade][country][city])) {
        gradosData[grade][country][city][university] = { Asignaturas: [] };
      } else if (
        !Array.isArray(gradosData[grade][country][city][university].Asignaturas)
      ) {
        gradosData[grade][country][city][university].Asignaturas = [];
      }

      // Añade la nueva asignatura al array correspondiente
      gradosData[grade][country][city][university].Asignaturas.push(newSubject);
      // Actualiza el documento con el nuevo array de asignaturas
      await updateDoc(gradosRef, gradosData); //updatedField
      console.log("Subject added successfully");
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error adding the subject:", error);
  }
}

async function removeSubjectsByCode() {
  const codeToRemove = document.getElementById("id_subject_remove").value; // Asume que tienes un input con este ID.
  const gradosRef = doc(db, "asignaturas", "Grados"); // Referencia al documento que contiene los grados.

  try {
    const gradosSnap = await getDoc(gradosRef);
    console.log("Grados:", gradosSnap.exists());

    if (gradosSnap.exists()) {
      let data = gradosSnap.data(); // Obtiene los datos actuales.

      // Aquí necesitas definir cómo iterar sobre tus datos y filtrar las asignaturas.
      // Este es un pseudocódigo que deberás ajustar según tu estructura exacta.
      Object.keys(data).forEach((gradoKey) => {
        Object.keys(data[gradoKey]).forEach((paisKey) => {
          Object.keys(data[gradoKey][paisKey]).forEach((ciudadKey) => {
            Object.keys(data[gradoKey][paisKey][ciudadKey]).forEach(
              (universidadKey) => {
                let asignaturas =
                  data[gradoKey][paisKey][ciudadKey][universidadKey]
                    .Asignaturas;
                let asignaturasFiltradas = asignaturas.filter(
                  (asignatura) =>
                    asignatura.code_origin !== codeToRemove &&
                    asignatura.code_destiny !== codeToRemove
                );
                // Actualiza las asignaturas filtradas.
                data[gradoKey][paisKey][ciudadKey][universidadKey].Asignaturas =
                  asignaturasFiltradas;
              }
            );
          });
        });
      });

      // Finalmente, actualiza el documento en Firestore con los datos filtrados.
      await updateDoc(gradosRef, data);
      console.log("Asignaturas actualizadas en Firestore.");
    }
  } catch (error) {
    //   console.log('Grados:', gradosSnap.exists());
    console.error("Error al intentar eliminar asignaturas por código:", error);
  }
}

document
  .getElementById("btn-remove-subject")
  .addEventListener("click", removeSubjectsByCode);

async function removeSubjectByIdPair() {
  const idPairToRemove = document.getElementById("id_pair_remove").value; // Assuming you have an input with this ID.
  const gradosRef = doc(db, "asignaturas", "Grados"); // Reference to the document that contains the degrees.

  try {
    const gradosSnap = await getDoc(gradosRef);
    console.log("Grados:", gradosSnap.exists());

    if (gradosSnap.exists()) {
      let data = gradosSnap.data(); // Get the current data.

      // Iterate over the data and filter the subjects.
      Object.keys(data).forEach((gradoKey) => {
        Object.keys(data[gradoKey]).forEach((paisKey) => {
          Object.keys(data[gradoKey][paisKey]).forEach((ciudadKey) => {
            Object.keys(data[gradoKey][paisKey][ciudadKey]).forEach(
              (universidadKey) => {
                let asignaturas =
                  data[gradoKey][paisKey][ciudadKey][universidadKey]
                    .Asignaturas;
                let asignaturasFiltradas = asignaturas.filter(
                  (asignatura) => asignatura.code_pair !== idPairToRemove
                );
                // Update the filtered subjects.
                data[gradoKey][paisKey][ciudadKey][universidadKey].Asignaturas =
                  asignaturasFiltradas;
              }
            );
          });
        });
      });

      // Finally, update the document in Firestore with the filtered data.
      await updateDoc(gradosRef, data);
      console.log("Subjects updated in Firestore.");
    }
  } catch (error) {
    console.error("Error removing subjects by ID pair:", error);
  }
}

document
  .getElementById("btn-remove-convalidation")
  .addEventListener("click", removeSubjectByIdPair);

// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const {db } = initializeFirebase();

// Función para llenar los selects con los datos proporcionados sin duplicados
function llenarSelect(selectId, opciones) {
    const select = document.getElementById(selectId);

    opciones.forEach(opcion => {
        // Añade la opción si no existe ya en el select
        if (!Array.from(select.options).map(opt => opt.value).includes(opcion)) {
            const elementoOpcion = document.createElement('option');
            elementoOpcion.value = opcion;
            elementoOpcion.textContent = opcion;
            select.appendChild(elementoOpcion);
        }
    });
}

// Función asíncrona que obtiene los datos y los carga en los selects
async function cargarDestinos() {
    const destinosRef = collection(db, 'destinos');
    const querySnapshot = await getDocs(destinosRef);

    if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            llenarSelect('university', [doc.id]);  // Usamos el ID del documento como nombre de la universidad
            
            if (data.TitulacionesDisponibles) {
                llenarSelect('grade', data.TitulacionesDisponibles);
            }
            if (data.Pais) {
                llenarSelect('country', [data.Pais]);
            }
            if (data.Ciudad) {
                llenarSelect('city', [data.Ciudad]);
            }
        });
    } else {
        console.log("No se encontraron los destinos!");
    }
}

// Ejecuta la carga de destinos al cargar la página
document.addEventListener('DOMContentLoaded', cargarDestinos);

// Agrega evento al botón de confirmación para redirigir a la nueva página
document.getElementById('confirmButton').addEventListener('click', redirectToAvailableDestinations);

// Función para redirigir a la nueva página
function redirectToAvailableDestinations() {
    const gradeValue = document.getElementById('grade').value;
    const universityValue = document.getElementById('university').value;
    const countryValue = document.getElementById('country').value;
    const cityValue = document.getElementById('city').value;

    const params = new URLSearchParams({
        grade: gradeValue,
        university: universityValue,
        country: countryValue,
        city: cityValue
    });

    window.location.href = `../templates/available_destinations.html?${params.toString()}`;
}

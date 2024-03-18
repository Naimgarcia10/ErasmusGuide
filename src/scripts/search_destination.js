// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

// Referencia al documento específico de donde se obtendrán los datos
const destinosRef = doc(db, 'destinos', 'Universidades');
// Función para llenar los selects con los datos proporcionados sin duplicados
function llenarSelect(selectId, opciones) {
    const select = document.getElementById(selectId);
    const opcionesExistentes = new Set(); // Usaremos un Set para registrar las opciones ya añadidas

    // Obtiene las opciones actuales y las añade al Set
    for (let i = 0; i < select.options.length; i++) {
        opcionesExistentes.add(select.options[i].value);
    }

    opciones.forEach(opcion => {
        // Añade la opción si no está ya en el Set
        if (!opcionesExistentes.has(opcion)) {
            const elementoOpcion = document.createElement('option');
            elementoOpcion.value = opcion;
            elementoOpcion.textContent = opcion;
            select.appendChild(elementoOpcion);
            opcionesExistentes.add(opcion); // Registra la nueva opción
        }
    });
}

// Función asíncrona que obtiene los datos y los carga en los selects
async function cargarDestinos() {
    const destinosSnap = await getDoc(destinosRef);

    if (destinosSnap.exists()) {
        const destinosData = destinosSnap.data();
        const gradosAgregados = new Set();
        const paisesAgregados = new Set();

        for (const [key, value] of Object.entries(destinosData)) {
            console.log(key, value); // Depuración: muestra la clave y el valor

            // Añade titulaciones disponibles evitando duplicados
            if(value.TitulacionesDisponibles) {
                value.TitulacionesDisponibles.forEach(titulacion => {
                    if (!gradosAgregados.has(titulacion)) {
                        llenarSelect('grade', [titulacion]);
                        gradosAgregados.add(titulacion);
                    }
                });
            }

            // Añade universidades, ciudades y países evitando duplicados
            llenarSelect('university', [key]);
            
            if(value.Pais && !paisesAgregados.has(value.Pais)) {
                llenarSelect('country', [value.Pais]);
                paisesAgregados.add(value.Pais);
            }
            
            // Ciudades pueden duplicarse si corresponden a diferentes países/universidades
            if(value.Ciudad) {
                llenarSelect('city', [value.Ciudad]);
            }
        }
    } else {
        console.log("No se encontraron los destinos!");
    }
}

// Ejecuta la carga de destinos al cargar la página
document.addEventListener('DOMContentLoaded', cargarDestinos);

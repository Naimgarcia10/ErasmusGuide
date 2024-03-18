// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

// Referencia al documento específico de donde se obtendrán los datos
const destinosRef = doc(db, 'destinos', 'Universidades');

// Función asíncrona que obtiene los datos y los carga en la página
async function cargarUniversidades() {
    const destinosSnap = await getDoc(destinosRef);

    if (destinosSnap.exists()) {
        const destinosData = destinosSnap.data();
        const universitiesContainer = document.getElementById('universitiesContainer');
        // Limpia el contenedor antes de agregar nuevas tarjetas
        universitiesContainer.innerHTML = '';

        for (const [universityName, universityData] of Object.entries(destinosData)) {
            const card = crearTarjetaUniversidad(universityName, universityData);
            universitiesContainer.appendChild(card);
        }
    } else {
        console.log("No se encontraron universidades!");
    }
}

// Función para crear la tarjeta de una universidad
function crearTarjetaUniversidad(universityName, universityData) {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = universityName;
    card.appendChild(title);

    // Agrega más información de la universidad aquí
    const infoPais = document.createElement('p');
    infoPais.textContent = `País: ${universityData.Pais}`;
    card.appendChild(infoPais);

    // Repite para otros datos relevantes de la universidad
    const infoCiudad = document.createElement('p');
    infoCiudad.textContent = `Ciudad: ${universityData.Ciudad}`;
    card.appendChild(infoCiudad);

    const infoNumeroConvenio = document.createElement('p');
    infoNumeroConvenio.textContent = `Número de convenio: ${universityData.NumeroConvenio}`;
    card.appendChild(infoNumeroConvenio);

    const infoIdiomaImparticion = document.createElement('p');
    infoIdiomaImparticion.textContent = `Idioma de impartición: ${universityData.IdiomaImparticion}`;
    card.appendChild(infoIdiomaImparticion);

    const infoEstudios = document.createElement('p');
    infoEstudios.textContent = `Estudios Ofrecidos: ${universityData.Estudios}`;
    card.appendChild(infoEstudios);

    const infoDuracionMeses = document.createElement('p');
    infoDuracionMeses.textContent = `Duración: ${universityData.DuracionMeses} meses`;
    card.appendChild(infoDuracionMeses);

    const infoPlazas = document.createElement('p');
    infoPlazas.textContent = `Plazas: ${universityData.Plazas}`;
    card.appendChild(infoPlazas);



    return card;
}

// Ejecuta la carga de universidades al cargar la página
document.addEventListener('DOMContentLoaded', cargarUniversidades);

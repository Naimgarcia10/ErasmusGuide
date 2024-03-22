// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let destinosData;
let universidadesFiltradas = {};


// Inicializa Firebase
const { app, db } = initializeFirebase();

// Referencia al documento específico de donde se obtendrán los datos
const destinosRef = doc(db, 'destinos', 'Universidades');

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

    const infoTitulacionesDisponibles = document.createElement('p');
    infoTitulacionesDisponibles.textContent = `Titulaciones Disponibles: ${universityData.TitulacionesDisponibles.join(', ')}`;
    card.appendChild(infoTitulacionesDisponibles);



    return card;
}

async function cargarUniversidadesFiltradas(grade, university, country, city) {
    const destinosSnap = await getDoc(destinosRef);

    if (destinosSnap.exists()) {
        destinosData = destinosSnap.data();
        universidadesFiltradas = filtrarDestinos(destinosData, grade, university, country, city); // Actualiza universidadesFiltradas
        mostrarUniversidades(universidadesFiltradas);
    } else {
        console.log("No se encontraron universidades!");
    }
}


function filtrarDestinos(data, grade, university, country, city) {
    return Object.entries(data).reduce((filtered, [universityName, universityData]) => {
        if ((grade && !universityData.TitulacionesDisponibles.includes(grade)) ||
            (university && universityName !== university) ||
            (country && universityData.Pais !== country) ||
            (city && universityData.Ciudad !== city)) {
            return filtered;
        }
        filtered[universityName] = universityData;
        return filtered;
    }, {});
}

function mostrarUniversidades(universidades) {
    const universitiesContainer = document.getElementById('universitiesContainer');
    universitiesContainer.innerHTML = ''; // Limpia el contenedor

    for (const [universityName, universityData] of Object.entries(universidades)) {
        const card = crearTarjetaUniversidad(universityName, universityData);
        universitiesContainer.appendChild(card);
    }
}

function ordenarYMostrarUniversidades(campo, esNumerico = false) {
    // Asegúrate de usar universidadesFiltradas en lugar de destinosData
    const universidadesOrdenadas = ordenarUniversidades(campo, esNumerico, universidadesFiltradas);
    mostrarUniversidades(universidadesOrdenadas);
}

function ordenarUniversidades(campo, esNumerico = false, datosParaOrdenar) {
    return Object.entries(datosParaOrdenar).sort((a, b) => {
        let valA = a[1][campo] || (esNumerico ? "0" : "");
        let valB = b[1][campo] || (esNumerico ? "0" : "");

        if (campo === 'TitulacionesDisponibles') {
            valA = [...(valA || [])].sort()[0] || ""; 
            valB = [...(valB || [])].sort()[0] || "";
        }

        if (esNumerico) {
            return Number(valA) - Number(valB);
        } else {
            valA = valA || "";
            valB = valB || "";
            return valA.localeCompare(valB);
        }
    }).reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
}

// Eventos para los botones de ordenación
document.getElementById('sortByAgreementNumber').addEventListener('click', () => ordenarYMostrarUniversidades('NumeroConvenio', true));
document.getElementById('sortByCountry').addEventListener('click', () => ordenarYMostrarUniversidades('Pais'));
document.getElementById('sortByCity').addEventListener('click', () => ordenarYMostrarUniversidades('Ciudad'));
document.getElementById('sortByGrade').addEventListener('click', () => ordenarYMostrarUniversidades('TitulacionesDisponibles'));
document.getElementById('sortByLanguage').addEventListener('click', () => ordenarYMostrarUniversidades('IdiomaImparticion'));
document.getElementById('sortByPlaces').addEventListener('click', () => ordenarYMostrarUniversidades('Plazas', true));
document.getElementById('sortByDuration').addEventListener('click', () => ordenarYMostrarUniversidades('DuracionMeses', true));



// Ejecuta la carga de universidades al cargar la página

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gradeFilter = urlParams.get('grade');
    const universityFilter = urlParams.get('university');
    const countryFilter = urlParams.get('country');
    const cityFilter = urlParams.get('city');

    cargarUniversidadesFiltradas(gradeFilter, universityFilter, countryFilter, cityFilter);
});



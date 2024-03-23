// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let destinosData;
let universidadesFiltradas = {};
let esCoordinador = true; 


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

    if (esCoordinador) {
        const iconoEditar = new Image();
        iconoEditar.src = '../media/lapiz.png';
        iconoEditar.addEventListener('click', () => abrirDialogoEditar(universityName, universityData));
        card.appendChild(iconoEditar);

        const iconoEliminar = new Image();
        iconoEliminar.src = '../media/papelera.png';
        iconoEliminar.addEventListener('click', () => eliminarUniversidad(universityName));
        card.appendChild(iconoEliminar);

        const añadirUniversidadButton = document.getElementById('añadirUniversidad');
        añadirUniversidadButton.style.display = 'block';


    }
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

/*##################################################################
################### FUNCIONES PARA EL COORDINADOR ##################
##################################################################*/

function abrirDialogoEditar(universityName, universityData) {
    // Mostrar el modal
    const modal = document.getElementById('modalEditar');
    modal.style.display = "block";

    // Obtener el contenedor del contenido del modal y limpiarlo
    const modalContent = document.querySelector('.modal-content');
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
        <label for="nombreUniversidad">Nombre:</label>
        <input type="text" id="nombreUniversidad" name="nombreUniversidad" value="${universityName}"><br>

        <!-- Repite esto para cada campo de información de la universidad que quieras editar -->

        <label for="pais">País:</label>
        <input type="text" id="pais" name="pais" value="${universityData.Pais}"><br>

        <label for="ciudad">Ciudad:</label>
        <input type="text" id="ciudad" name="ciudad" value="${universityData.Ciudad}"><br>

        <label for="numeroConvenio">Número de convenio:</label>
        <input type="text" id="numeroConvenio" name="numeroConvenio" value="${universityData.NumeroConvenio}"><br>

        <label for="idiomaImparticion">Idioma de impartición:</label>
        <input type="text" id="idiomaImparticion" name="idiomaImparticion" value="${universityData.IdiomaImparticion}"><br>
        
        <label for="estudios">Estudios Ofrecidos:</label>
        <input type="text" id="estudios" name="estudios" value="${universityData.Estudios}"><br>

        <label for="duracionMeses">Duración (meses):</label>
        <input type="text" id="duracionMeses" name="duracionMeses" value="${universityData.DuracionMeses}"><br>

        <label for="plazas">Plazas:</label>
        <input type="text" id="plazas" name="plazas" value="${universityData.Plazas}"><br>

        <label for="titulacionesDisponibles">Titulaciones Disponibles:</label>
        <input type="text" id="titulacionesDisponibles" name="titulacionesDisponibles" value="${universityData.TitulacionesDisponibles.join(', ')}"><br>

        <button id="guardarCambios">Guardar cambios</button>

    `;

    // Añadir el formulario al modal
    modalContent.appendChild(formContainer);

    // Añadir funcionalidad para cerrar el modal
    const closeButton = document.querySelector('.close-button');
    closeButton.onclick = function() {
        modal.style.display = "none";
        modalContent.removeChild(formContainer); // Limpiar el formulario
    };

    // Añadir funcionalidad para guardar los cambios
    const guardarCambiosButton = document.getElementById('guardarCambios');
    guardarCambiosButton.onclick = function() {
        console.log('Cambios guardados!');
    };

    // Asegúrate de manejar el guardado de los cambios aquí,
    // posiblemente enviando los datos actualizados a tu base de datos
}

function eliminarUniversidad(universityName) {
    // Mensaje de confirmación antes de proceder a eliminar
    const confirmar = confirm(`Se va a borrar el destino: Universidad de ${universityName}, ¿está seguro?`);
    
    if (confirmar) {
        // Aquí va la lógica para eliminar la universidad de la base de datos
        console.log(`Eliminando la universidad: ${universityName}`);
        // Por ejemplo: eliminarUniversidadDeLaBaseDeDatos(universityName);
        
        // Después de eliminar, podrías refrescar la lista de universidades mostradas o mostrar un mensaje de éxito.
    } else {
        // Si el usuario cancela, simplemente cerramos el diálogo sin hacer nada
        console.log("Operación cancelada");
    }
}


// En tu JavaScript, similar a cómo manejas los otros iconos
document.getElementById('añadirUniversidad').addEventListener('click', () => {
    console.log("Añadir universidad...");

    // Mostrar el modal
    const modal = document.getElementById('modalEditar');
    modal.style.display = "block";

    // Obtener el contenedor del contenido del modal y limpiarlo
    const modalContent = document.querySelector('.modal-content');
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
        <label for="nombreUniversidad">Nombre:</label>
        <input type="text" id="nombreUniversidad" name="nombreUniversidad"><br>

        <label for="pais">País:</label>
        <input type="text" id="pais" name="pais"><br>

        <label for="ciudad">Ciudad:</label>
        <input type="text" id="ciudad" name="ciudad"><br>

        <label for="numeroConvenio">Número de convenio:</label>
        <input type="text" id="numeroConvenio" name="numeroConvenio"><br>

        <label for="idiomaImparticion">Idioma de impartición:</label>
        <input type="text" id="idiomaImparticion" name="idiomaImparticion"><br>
        
        <label for="estudios">Estudios Ofrecidos:</label>
        <input type="text" id="estudios" name="estudios"><br>

        <label for="duracionMeses">Duración (meses):</label>
        <input type="text" id="duracionMeses" name="duracionMeses"><br>

        <label for="plazas">Plazas:</label>
        <input type="text" id="plazas" name="plazas"><br>

        <label for="titulacionesDisponibles">Titulaciones Disponibles:</label>
        <input type="text" id="titulacionesDisponibles" name="titulacionesDisponibles"><br>

        <button id="guardarCambios">Guardar cambios</button>

    `;

    // Añadir el formulario al modal
    modalContent.appendChild(formContainer);

    // Añadir funcionalidad para cerrar el modal
    const closeButton = document.querySelector('.close-button');
    closeButton.onclick = function() {
        modal.style.display = "none";
        modalContent.removeChild(formContainer); // Limpiar el formulario
    };

    // Añadir funcionalidad para guardar los cambios
    const guardarCambiosButton = document.getElementById('guardarCambios');
    guardarCambiosButton.onclick = function() {
        console.log('Cambios guardados!');
    };

    // Asegúrate de manejar el guardado de los cambios aquí,
    // posiblemente enviando los datos actualizados a tu base de datos
    
});


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



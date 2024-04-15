// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let destinosData;
let universidadesFiltradas = {};
let esCoordinador = true; 


// Inicializa Firebase
const {db } = initializeFirebase();

// Referencia al documento específico de donde se obtendrán los datos
const destinosRef = doc(db, 'destinos', 'Universidades');

// Función para crear la tarjeta de una universidad
function crearTarjetaUniversidad(universityName, universityData, esCoordinador) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    const card = document.createElement('div');
    card.className = 'card-inner';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.innerHTML = `
        <p>${universityData.NumeroConvenio}</p>
        <h3>${universityName}</h3>
        <p>País: ${universityData.Pais}</p>
        <p>Ciudad: ${universityData.Ciudad}</p>
    `;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.innerHTML = `
        <p>Idioma de impartición: ${universityData.IdiomaImparticion}</p>
        <p>Estudios Ofrecidos: ${universityData.Estudios}</p>
        <p>Duración: ${universityData.DuracionMeses} meses</p>
        <p>Plazas: ${universityData.Plazas}</p>
        <p>Titulaciones Disponibles: ${universityData.TitulacionesDisponibles.join(', ')}</p>
    `;

    card.appendChild(cardFront);
    card.appendChild(cardBack);
    cardContainer.appendChild(card);


        const iconoEditar = new Image();
        iconoEditar.src = '../media/lapiz.png';
        iconoEditar.addEventListener('click', () => abrirDialogoEditar(universityName, universityData));
        iconoEditar.setAttribute('class', 'iconoEditar');
        cardBack.appendChild(iconoEditar);

        const iconoEliminar = new Image();
        iconoEliminar.src = '../media/papelera.png';
        iconoEliminar.addEventListener('click', () => eliminarUniversidad(universityName));
        iconoEliminar.setAttribute('class', 'iconoEliminar');
        cardBack.appendChild(iconoEliminar);

        const añadirUniversidadButton = document.getElementById('añadirUniversidad');
        añadirUniversidadButton.style.display = 'block';
    


    return cardContainer;
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

        <button id="guardarCambiosButton">Guardar cambios</button>

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
    guardarCambiosButton.onclick = async function() {
        // Obtener los valores del formulario
        const updatedData = {
            Pais: document.getElementById('pais').value,
            Ciudad: document.getElementById('ciudad').value,
            NumeroConvenio: document.getElementById('numeroConvenio').value,
            IdiomaImparticion: document.getElementById('idiomaImparticion').value,
            Estudios: document.getElementById('estudios').value,
            DuracionMeses: document.getElementById('duracionMeses').value,
            Plazas: document.getElementById('plazas').value,
            TitulacionesDisponibles: document.getElementById('titulacionesDisponibles').value.split(',').map(titulacion => titulacion.trim()),
        };
        console.log("universityName", universityName);
        // Asegúrate de que la referencia a la universidad es correcta
        const universityRef = doc(db, 'Universidades', universityName);
        console.log(universityRef.Pais);

        /*try {
            await updateDoc(universityRef, updatedData);
            console.log('Cambios guardados con éxito!');
            modal.style.display = "none"; // Cierra el modal después de guardar
            modalContent.removeChild(formContainer); // Limpia el formulario
            // Aquí puedes también refrescar los datos mostrados en la página o confirmar al usuario que los datos fueron actualizados
        } catch (error) {
            console.error("Error al guardar los cambios: ", error);
            // Manejar el error (p.ej., mostrar un mensaje al usuario)
        }*/
    };
    

}





function eliminarUniversidad(universityName) {
    // Mensaje de confirmación antes de proceder a eliminar
    const confirmar = confirm(`Se va a borrar el destino: Universidad de ${universityName}, ¿está seguro?`);
    
    if (confirmar) {
        // Referencia al documento de la universidad que se desea eliminar
        const universityRef = doc(db,'Universidades', universityName);
        
        // Eliminar el documento
        deleteDoc(universityRef)
            .then(() => {
                console.log(`Universidad ${universityName} eliminada con éxito.`);
                // Aquí podrías refrescar la lista de universidades mostradas o mostrar un mensaje de éxito.
            })
            .catch((error) => {
                console.error("Error al eliminar la universidad: ", error);
                // Manejar el error, por ejemplo, mostrando un mensaje al usuario.
            });
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



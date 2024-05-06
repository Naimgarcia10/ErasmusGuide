// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let destinosData;
let universidadesFiltradas = [];
let esCoordinador = true;

// Inicializa Firebase
const { db } = initializeFirebase();

/*########################################################################
####FUNCION PARA AÑADIR LOS CAMPOS DE LAS UNIVERSIDADES A LA TARJETA #####
##########################################################################*/

function crearTarjetaUniversidad(
  universityName,
  universityData,
  esCoordinador
) {
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  const card = document.createElement("div");
  card.className = "card-inner";

  const cardFront = document.createElement("div");
  cardFront.className = "card-front";
  cardFront.innerHTML = `
        <p>${universityData.NumeroConvenio}</p>
        <h3>${universityName}</h3>
        <p>País: ${universityData.Pais}</p>
        <p>Ciudad: ${universityData.Ciudad}</p>
    `;

  const cardBack = document.createElement("div");
  cardBack.className = "card-back";
  cardBack.innerHTML = `
        <p>Idioma de impartición: ${universityData.IdiomaImparticion}</p>
        <p>Estudios Ofrecidos: ${universityData.Estudios}</p>
        <p>Duración: ${universityData.DuracionMeses} meses</p>
        <p>Plazas: ${universityData.Plazas}</p>
        <p>Titulaciones Disponibles: ${universityData.TitulacionesDisponibles.join(
          ", "
        )}</p>
        <button class="review-bttn" id="EscribirOpinionesButton-${universityName}"> Escribir Opinion </button>
    `;
  //Esperar a que el DOM se actualice
  setTimeout(() => {
    document
      .getElementById(`EscribirOpinionesButton-${universityName}`)
      .addEventListener("click", function () {
        abrirModalOpiniones(universityName);
      });
  }, 0);

  card.appendChild(cardFront);
  card.appendChild(cardBack);
  cardContainer.appendChild(card);

  const iconoEditar = new Image();
  iconoEditar.src = "../media/lapiz.png";
  iconoEditar.addEventListener("click", () =>
    abrirDialogoEditar(universityName, universityData)
  );
  iconoEditar.setAttribute("class", "iconoEditar");
  cardBack.appendChild(iconoEditar);

  const iconoEliminar = new Image();
  iconoEliminar.src = "../media/papelera.png";
  iconoEliminar.addEventListener("click", () =>
    eliminarUniversidad(universityName)
  );
  iconoEliminar.setAttribute("class", "iconoEliminar");
  cardBack.appendChild(iconoEliminar);

  const añadirUniversidadButton = document.getElementById("añadirUniversidad");
  añadirUniversidadButton.style.display = "block";

  return cardContainer;
}

/*############################################################################################################
#####FUNCION PARA CARGAR LA INFORMACION DE LAS UNIVERSIDADES DESDE LA BASE DE DATOS Y APLICAR LOS FILTROS ####
##############################################################################################################*/

async function cargarUniversidadesFiltradas(grade, university, country, city) {
  // Lista de referencias de universidades
  const universidadesRef = [
    "UniversidadAGH",
    "UniversidadParma",
    "UniversidadParis",
  ]; // Extiende esta lista según sea necesario
  let universidades = [];

  for (const univRef of universidadesRef) {
    const docRef = doc(db, "destinos", univRef);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const universityData = docSnap.data();
      universityData.universityName = univRef; // Guardar el nombre para usarlo más tarde
      universidades.push(universityData);
    }
  }

  // Filtrar los datos cargados
  universidadesFiltradas = filtrarDestinos(
    universidades,
    grade,
    university,
    country,
    city
  );
  mostrarUniversidades(universidadesFiltradas);
}

function filtrarDestinos(universidades, grade, university, country, city) {
  return universidades.filter((univ) => {
    return (
      (!grade ||
        (univ.TitulacionesDisponibles &&
          univ.TitulacionesDisponibles.includes(grade))) &&
      (!university || univ.universityName === university) &&
      (!country || univ.Pais === country) &&
      (!city || univ.Ciudad === city)
    );
  });
}

/*############################################################################################################
##################FUNCION PARA MOSTRAR LAS TARJETAS ORDENADAS POR ALGUN CAMPO ################################
##############################################################################################################*/

function mostrarUniversidades(universidades) {
  const universitiesContainer = document.getElementById(
    "universitiesContainer"
  );
  universitiesContainer.innerHTML = ""; // Limpia el contenedor antes de añadir nuevas tarjetas

  universidades.forEach((univData) => {
    const card = crearTarjetaUniversidad(univData.universityName, univData);
    universitiesContainer.appendChild(card);
  });
}

function ordenarYMostrarUniversidades(campo, esNumerico = false) {
  const universidadesOrdenadas = ordenarUniversidades(
    campo,
    esNumerico,
    universidadesFiltradas
  );
  mostrarUniversidades(universidadesOrdenadas);
}

function ordenarUniversidades(campo, esNumerico = false, datosParaOrdenar) {
  return datosParaOrdenar.sort((a, b) => {
    let valA = a[campo] || (esNumerico ? 0 : "");
    let valB = b[campo] || (esNumerico ? 0 : "");

    // Manejo especial para arrays (ejemplo: TitulacionesDisponibles)
    if (campo === "TitulacionesDisponibles") {
      valA = [...(valA || [])].sort()[0] || "";
      valB = [...(valB || [])].sort()[0] || "";
    }

    // Comparar valores numéricos o strings
    if (esNumerico) {
      return Number(valA) - Number(valB);
    } else {
      return valA.localeCompare(valB);
    }
  });
}

/*##################################################################
################### FUNCIONES PARA EL COORDINADOR ##################
##################################################################*/

function abrirDialogoEditar(universityName, universityData) {
  const modal = document.getElementById("modalEditar");
  modal.style.display = "block";
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = ""; // Limpiar el contenido anterior

  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
        <label for="nombreUniversidad">Nombre:</label>
        <input type="text" id="nombreUniversidad" name="nombreUniversidad" value="${universityName}" disabled><br>
        <label for="pais">País:</label>
        <input type="text" id="pais" name="pais" value="${
          universityData.Pais
        }"><br>
        <label for="ciudad">Ciudad:</label>
        <input type="text" id="ciudad" name="ciudad" value="${
          universityData.Ciudad
        }"><br>
        <label for="numeroConvenio">Número de convenio:</label>
        <input type="text" id="numeroConvenio" name="numeroConvenio" value="${
          universityData.NumeroConvenio
        }"><br>
        <label for="idiomaImparticion">Idioma de impartición:</label>
        <input type="text" id="idiomaImparticion" name="idiomaImparticion" value="${
          universityData.IdiomaImparticion
        }"><br>
        <label for="estudios">Estudios Ofrecidos:</label>
        <input type="text" id="estudios" name="estudios" value="${
          universityData.Estudios
        }"><br>
        <label for="duracionMeses">Duración (meses):</label>
        <input type="text" id="duracionMeses" name="duracionMeses" value="${
          universityData.DuracionMeses
        }"><br>
        <label for="plazas">Plazas:</label>
        <input type="text" id="plazas" name="plazas" value="${
          universityData.Plazas
        }"><br>
        <label for="titulacionesDisponibles">Titulaciones Disponibles:</label>
        <input type="text" id="titulacionesDisponibles" name="titulacionesDisponibles" value="${universityData.TitulacionesDisponibles.join(
          ", "
        )}"><br>
        <button id="guardarCambiosButton">Guardar cambios</button>
    `;
  modalContent.appendChild(formContainer);

  const guardarCambiosButton = document.getElementById("guardarCambiosButton");
  guardarCambiosButton.addEventListener("click", () =>
    actualizarUniversidad(universityName)
  );
}

async function actualizarUniversidad(universityName) {
  const updatedData = {
    Pais: document.getElementById("pais").value,
    Ciudad: document.getElementById("ciudad").value,
    NumeroConvenio: document.getElementById("numeroConvenio").value,
    IdiomaImparticion: document.getElementById("idiomaImparticion").value,
    Estudios: document.getElementById("estudios").value,
    DuracionMeses: document.getElementById("duracionMeses").value,
    Plazas: document.getElementById("plazas").value,
    TitulacionesDisponibles: document
      .getElementById("titulacionesDisponibles")
      .value.split(",")
      .map((t) => t.trim()),
  };

  try {
    const universityRef = doc(db, "destinos", universityName);
    await updateDoc(universityRef, updatedData);
    console.log("Cambios guardados con éxito!");
    document.getElementById("modalEditar").style.display = "none"; // Cierra el modal después de guardar
  } catch (error) {
    console.error("Error al guardar los cambios: ", error);
  }
}

function eliminarUniversidad(universityName) {
  const confirmar = confirm(
    `Se va a borrar el destino: Universidad de ${universityName}, ¿está seguro?`
  );
  if (confirmar) {
    const universityRef = doc(db, "destinos", universityName);
    deleteDoc(universityRef)
      .then(() => {
        console.log(`Universidad ${universityName} eliminada con éxito.`);
      })
      .catch((error) => {
        console.error("Error al eliminar la universidad: ", error);
      });
  } else {
    console.log("Operación cancelada");
  }
}

document.getElementById("añadirUniversidad").addEventListener("click", () => {
  const modal = document.getElementById("modalEditar");
  modal.style.display = "block";
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = ""; // Limpiar el contenido anterior

  const formContainer = document.createElement("div");
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

        <button id="guardarCambiosNuevaUniversidad">Guardar nueva universidad</button>
    `;
  modalContent.appendChild(formContainer);

  // Añadir funcionalidad para guardar la nueva universidad
  document
    .getElementById("guardarCambiosNuevaUniversidad")
    .addEventListener("click", crearNuevaUniversidad);
});

async function crearNuevaUniversidad() {
  const db = getFirestore(); // Asegúrate de obtener la instancia de Firestore
  const nombreUniversidad = document
    .getElementById("nombreUniversidad")
    .value.trim();

  const nuevaUniversidadData = {
    Pais: document.getElementById("pais").value,
    Ciudad: document.getElementById("ciudad").value,
    NumeroConvenio: document.getElementById("numeroConvenio").value,
    IdiomaImparticion: document.getElementById("idiomaImparticion").value,
    Estudios: document.getElementById("estudios").value,
    DuracionMeses: document.getElementById("duracionMeses").value,
    Plazas: document.getElementById("plazas").value,
    TitulacionesDisponibles: document
      .getElementById("titulacionesDisponibles")
      .value.split(",")
      .map((t) => t.trim()),
  };

  if (!nombreUniversidad) {
    console.error("El nombre de la universidad es requerido");
    return; // Detener la ejecución si no hay nombre
  }

  // Crear la referencia del documento usando el nombre de la universidad como ID
  const universityRef = doc(db, "destinos", nombreUniversidad);

  try {
    await setDoc(universityRef, nuevaUniversidadData);
    console.log("Nueva universidad añadida con éxito!");
    document.getElementById("modalEditar").style.display = "none"; // Cierra el modal después de guardar
  } catch (error) {
    console.error("Error al añadir nueva universidad: ", error);
  }
}

/*##################################################################
############################ EVENTOS ###############################
##################################################################*/

// Eventos para los botones de ordenación
document
  .getElementById("sortByAgreementNumber")
  .addEventListener("click", () =>
    ordenarYMostrarUniversidades("NumeroConvenio", true)
  );
document
  .getElementById("sortByCountry")
  .addEventListener("click", () => ordenarYMostrarUniversidades("Pais"));
document
  .getElementById("sortByCity")
  .addEventListener("click", () => ordenarYMostrarUniversidades("Ciudad"));
document
  .getElementById("sortByGrade")
  .addEventListener("click", () =>
    ordenarYMostrarUniversidades("TitulacionesDisponibles")
  );
document
  .getElementById("sortByLanguage")
  .addEventListener("click", () =>
    ordenarYMostrarUniversidades("IdiomaImparticion")
  );
document
  .getElementById("sortByPlaces")
  .addEventListener("click", () =>
    ordenarYMostrarUniversidades("Plazas", true)
  );
document
  .getElementById("sortByDuration")
  .addEventListener("click", () =>
    ordenarYMostrarUniversidades("DuracionMeses", true)
  );

// Ejecuta la carga de universidades al cargar la página

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gradeFilter = urlParams.get("grade");
  const universityFilter = urlParams.get("university");
  const countryFilter = urlParams.get("country");
  const cityFilter = urlParams.get("city");

  cargarUniversidadesFiltradas(
    gradeFilter,
    universityFilter,
    countryFilter,
    cityFilter
  );
});

//parte de pablo

function abrirModalOpiniones(universityName) {
  const modal = document.getElementById("modalEditar");
  modal.style.display = "block";
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = ""; // Limpiar el contenido anterior

  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Escribir Reseña</title>
        <link rel="stylesheet" href="../styles/main.css" />
        <link rel="stylesheet" href="../styles/writeReviews.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body>
        <div class="container">
          <h2>Escribir Reseña de ${universityName}</h2>
          <form action="/submit-review" method="post">
            <label for="rating">Puntuación:</label>
            <div class="rating">
              <i class="bi bi-star-fill star"></i>
              <i class="bi bi-star-fill star"></i>
              <i class="bi bi-star-fill star"></i>
              <i class="bi bi-star-fill star"></i>
              <i class="bi bi-star-fill star"></i>
            </div>

            <label for="review">Reseña:</label>
            <textarea id="review" name="review"></textarea>
          </form>
            <div class="review-bttn-box">
              <button class="review-bttns" type="submit">Enviar Reseña</button>
              <button class="review-bttns" id="closeModalButton">Cerrar</button>
            </div>
        </div>
      </body>
    </html>
  `;

  modalContent.appendChild(formContainer);

  // Manejo de eventos de las estrellas
  const stars = formContainer.querySelectorAll(".star");
  stars.forEach(function (star, index) {
    star.addEventListener("click", function () {
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add("checked");
      }
      for (let i = index + 1; i < stars.length; i++) {
        stars[i].classList.remove("checked");
      }
    });
  });

  // Event listener para cerrar el modal al hacer clic en el botón "Cerrar"
  const closeModalButton = document.getElementById("closeModalButton");
  closeModalButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  const submitReview = document.getElementById("submit-review");
  submitReview.addEventListener("click", () =>
    submitReviewFunction(universityName)
  );
}

/*
async function submitReviewFunction(universityName) {
  const updatedData = {
    Pais: document.getElementById("pais").value,
    Ciudad: document.getElementById("ciudad").value,
    NumeroConvenio: document.getElementById("numeroConvenio").value,
    IdiomaImparticion: document.getElementById("idiomaImparticion").value,
    Estudios: document.getElementById("estudios").value,
    DuracionMeses: document.getElementById("duracionMeses").value,
    Plazas: document.getElementById("plazas").value,
    TitulacionesDisponibles: document
      .getElementById("titulacionesDisponibles")
      .value.split(",")
      .map((t) => t.trim()),
  };

  try {
    const universityRef = doc(db, "destinos", universityName);
    await updateDoc(universityRef, updatedData);
    console.log("Cambios guardados con éxito!");
    document.getElementById("modalEditar").style.display = "none"; // Cierra el modal después de guardar
  } catch (error) {
    console.error("Error al guardar los cambios: ", error);
  }
}*/

//_____________________________________

//estrellas de reseña

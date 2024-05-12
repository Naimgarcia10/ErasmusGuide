// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";


import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getFirestore,
  arrayUnion,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

let universidadesFiltradas = [];
let role = sessionStorage.getItem("role");

// Inicializa Firebase
const { db } = initializeFirebase();

/*########################################################################
####FUNCION PARA AÑADIR LOS CAMPOS DE LAS UNIVERSIDADES A LA TARJETA #####
##########################################################################*/

function crearTarjetaUniversidad(
  universityName,
  universityData,
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
        <div id="review-bttns">
        <button class="review-bttn" id="EscribirOpinionesButton-${universityName}"> Escribir Opinion </button>
        <button class="review-bttn" id="LeerOpinionesButton-${universityName}">Leer Opiniones</button>
        </div>
    `;
  //Esperar a que el DOM se actualice
  setTimeout(() => {
    document
      .getElementById(`EscribirOpinionesButton-${universityName}`)
      .addEventListener("click", function () {
        abrirModalOpiniones(universityName);
      });
  }, 0);

  setTimeout(() => {
    document
      .getElementById(`LeerOpinionesButton-${universityName}`)
      .addEventListener("click", function () {
        abrirModalLeerOpiniones(universityName);
      });
  }, 0);

  card.appendChild(cardFront);
  card.appendChild(cardBack);
  cardContainer.appendChild(card);

  if(role === "coordinator"){

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
}

  return cardContainer;
}

/*############################################################################################################
#####FUNCION PARA CARGAR LA INFORMACION DE LAS UNIVERSIDADES DESDE LA BASE DE DATOS Y APLICAR LOS FILTROS ####
##############################################################################################################*/

async function cargarUniversidadesFiltradas(grade, university, country, city) {
  // Referencia a la colección de universidades
  const destinosRef = collection(db, "destinos");
  let universidades = [];

  // Obtener todos los documentos de la colección "destinos"
  const querySnapshot = await getDocs(destinosRef);
  querySnapshot.forEach(doc => {
    if (doc.exists()) {
      const universityData = doc.data();
      universityData.universityName = doc.id; // Guardar el nombre de la universidad usando el ID del documento
      universidades.push(universityData);
    }
  });

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

  // Crear y añadir botón de cierre
  const closeButton = document.createElement("button");
  closeButton.textContent = "Cerrar";
  closeButton.style.position = "absolute";
  closeButton.style.top = "100px";
  closeButton.style.right = "450px";
  closeButton.onclick = () => { modal.style.display = "none"; };

  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
        <label for="nombreUniversidad">Nombre:</label>
        <input type="text" id="nombreUniversidad" name="nombreUniversidad" value="${universityName}" disabled><br>
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
        <input type="text" id="titulacionesDisponibles" name="titulacionesDisponibles" value="${universityData.TitulacionesDisponibles.join(", ")}"><br>
        <label for="coordenadas">Coordenadas:</label>
        <input type="text" id="coordenadas" name="coordenadas" value="${universityData.Coordenadas}"><br>


        <button id="guardarCambiosButton">Guardar cambios</button>
    `;

  modalContent.appendChild(closeButton);
  modalContent.appendChild(formContainer);

  // Añadir funcionalidad para guardar los cambios de la universidad
  document.getElementById("guardarCambiosButton").addEventListener("click", () =>
    actualizarUniversidad(universityName)
  );

  // Añadir funcionalidad para cerrar el modal al hacer clic fuera del contenido del modal
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
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
    Coordenadas: document.getElementById("coordenadas").value
  };

  try {
    const universityRef = doc(db, "destinos", universityName);
    await updateDoc(universityRef, updatedData);
    console.log("Cambios guardados con éxito!");
    document.getElementById("modalEditar").style.display = "none"; // Cierra el modal después de guardar
    location.reload(); // Refresca la página para mostrar los cambios
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
        // Refrescar la página después de eliminar la universidad con éxito
        location.reload();
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

  // Crear y añadir botón de cierre
  const closeButton = document.createElement("button");
  closeButton.textContent = "Cerrar";
  closeButton.style.position = "absolute";
  closeButton.style.top = "100px";
  closeButton.style.right = "450px";
  closeButton.onclick = () => { modal.style.display = "none"; };

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

        <label for="coordenadas">Coordenadas:</label>
        <Input type="text" id="coordenadas" name="coordenadas""><br>

        <button id="guardarCambiosNuevaUniversidad">Guardar nueva universidad</button>
    `;

  modalContent.appendChild(closeButton);
  modalContent.appendChild(formContainer);

  // Añadir funcionalidad para guardar la nueva universidad
  document.getElementById("guardarCambiosNuevaUniversidad").addEventListener("click", crearNuevaUniversidad);

  // Añadir funcionalidad para cerrar el modal al hacer clic fuera del contenido del modal
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
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
    Coordenadas: document.getElementById("coordenadas").value
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
    location.reload(); // Refresca la página para mostrar los cambios
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
function abrirModalLeerOpiniones(universityName) {
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
        <title>Leer Reseñas</title>
        <link rel="stylesheet" href="../styles/main.css" />
      </head>
      <body>
        <div class="container">
          <h2>Reseñas de ${universityName}</h2>
          <div id="reviewsContainer">
          
          </div>
          <button class="review-bttns" id="closeModalButton">Cerrar</button>
        </div>
      </body>
    </html>
  `;

  modalContent.appendChild(formContainer);

  const closeModalButton = document.getElementById("closeModalButton");
  closeModalButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Cargar las reseñas de la universidad
  cargarReseñas(universityName);
}

async function cargarReseñas(universityName) {
  const universityRef = doc(db, "reviews", universityName);
  const universitySnap = await getDoc(universityRef);

  if (universitySnap.exists()) {
    const universityData = universitySnap.data();
    const reviews = universityData.Reviews || [];

    const reviewsContainer = document.getElementById("reviewsContainer");
    reviewsContainer.innerHTML = ""; // Limpiar el contenedor antes de añadir nuevas reseñas

    reviews.forEach((review, index) => {
      const reviewCard = document.createElement("div");
      reviewCard.className = "review-card";
      reviewCard.innerHTML = `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Leer Reseñas de ${universityName}</title>
            <link rel="stylesheet" href="../styles/main.css" />
            <link rel="stylesheet" href="../styles/readReviews.css" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
          </head>
          <body>
            <h3>Reseña ${index + 1}</h3>
            <p>Puntuación: ${review.rating}</p>
            <p>Reseña: ${review.review}</p>
          </body>
        </html>
      `;
      reviewsContainer.appendChild(reviewCard);
    });
  } else {
    console.log("No hay reseñas para esta universidad.");
  }
}

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
              <i class="bi bi-star-fill star" data-value="1"></i>
              <i class="bi bi-star-fill star" data-value="2"></i>
              <i class="bi bi-star-fill star" data-value="3"></i>
              <i class="bi bi-star-fill star" data-value="4"></i>
              <i class="bi bi-star-fill star" data-value="5"></i>
            </div>

            <label for="review">Reseña:</label>
            <textarea id="review" name="review"></textarea>
          </form>
            <div class="review-bttn-box">
              <button class="review-bttns" id="submitModalButton" type="submit">Enviar Reseña</button>
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

  const submitReview = document.getElementById("submitModalButton");
  submitReview.addEventListener("click", () =>
    submitReviewFunction(universityName)
  );

  setupStarRating(); // Configura el manejador de clic para las estrellas
}

let numStarsSelected = 0; // Esta variable guarda el número de estrellas seleccionadas

function setupStarRating() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      numStarsSelected = this.getAttribute("data-value"); // Actualiza con el valor de la estrella clickeada
      updateStars(stars, numStarsSelected); // Actualiza la UI
    });
  });
}

function updateStars(stars, selectedValue) {
  stars.forEach((star) => {
    if (parseInt(star.getAttribute("data-value")) <= selectedValue) {
      star.classList.add("checked");
    } else {
      star.classList.remove("checked");
    }
  });
}

async function submitReviewFunction(universityName) {
  const reviewText = document.getElementById("review").value;
  const rating = parseInt(numStarsSelected); // Asegúrate de que es un número.

  // Crea el objeto de reseña.
  const reviewData = { review: reviewText, rating: rating };

  // Referencia al documento específico para la universidad en la colección 'reviews'.
  const universityRef = doc(db, "reviews", universityName);

  try {
    // Usa setDoc con merge true para añadir la reseña o crear el documento si no existe.
    await setDoc(
      universityRef,
      {
        Reviews: arrayUnion(reviewData),
      },
      { merge: true }
    );
    console.log("Reseña añadida con éxito!");
    document.getElementById("modalEditar").style.display = "none"; // Cierra el modal tras el éxito.
  } catch (error) {
    console.error("Error al añadir la reseña: ", error);
  }
}

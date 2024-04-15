import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

async function addDiscussion(title, topic, city, body) {
  if (title.trim() === "") {
    console.error("El título no puede estar vacío");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "forum"), {
      title: title,
      createdAt: new Date(),
      thematic: topic,
      city: city,
      description: body
    });
    console.log("Discusión creada con éxito: ", docRef.id);
    
    // Actualiza la lista de discusiones tras añadir la nueva
    await showDiscussions();
  } catch (error) {
    console.error("Error al crear la discusión: ", error);
  }
}




async function showDiscussions() {
  const discussionsList = document.getElementById('discussionsList');
  discussionsList.innerHTML = ''; // Limpiar la lista antes de añadir elementos nuevos

  try {
    const querySnapshot = await getDocs(collection(db, "forum"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const discussionTitle = data.title;
      const discussionId = doc.id;

      // Elemento de lista para la discusión
      const discussionItem = document.createElement('li');

      // Span para el título
      const titleSpan = document.createElement('span');
      titleSpan.textContent = discussionTitle;

      // Botón para ver/ocultar respuestas
      const viewResponsesButton = document.createElement('button');
      viewResponsesButton.textContent = 'Ver Respuestas';
      viewResponsesButton.setAttribute('data-active', 'false'); // Control de visibilidad
      viewResponsesButton.onclick = () => {
        const isActive = viewResponsesButton.getAttribute('data-active') === 'true';
        if (isActive) {
          // Ocultar detalles si ya están mostrados
          const detailsContainer = document.getElementById('discussionDetails');
          detailsContainer.innerHTML = '';
          viewResponsesButton.textContent = 'Ver Respuestas';
          viewResponsesButton.setAttribute('data-active', 'false');
        } else {
          // Mostrar detalles si están ocultos
          displayDiscussionDetails(discussionId);
          viewResponsesButton.textContent = 'Ocultar Respuestas';
          viewResponsesButton.setAttribute('data-active', 'true');
        }
      };

      // Añade primero el título y luego el botón al elemento de lista
      discussionItem.appendChild(titleSpan);
      discussionItem.appendChild(viewResponsesButton);

      // Añadir el elemento de lista al contenedor principal
      discussionsList.appendChild(discussionItem);
    });
  } catch (error) {
    console.error("Error al mostrar las discusiones: ", error);
  }
}




// Función para mostrar los detalles de la discusión
async function displayDiscussionDetails(discussionId) {
  const detailsContainer = document.getElementById('discussionDetails');
  detailsContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nueva información

  const docRef = doc(db, "forum", discussionId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Ciudad
    const cityElement = document.createElement('p');
    cityElement.textContent = `Ciudad: ${data.city || 'Sin especificar'}`;
    detailsContainer.appendChild(cityElement);

    // Descripción
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = `Descripción: ${data.description || 'Sin descripción'}`;
    detailsContainer.appendChild(descriptionElement);

    // Temática
    const thematicElement = document.createElement('p');
    thematicElement.textContent = `Temática: ${data.thematic || 'Sin temática'}`;
    detailsContainer.appendChild(thematicElement);

    // Respuestas, si las hay
    if (data.responses && data.responses.length > 0) {
      const responsesTitle = document.createElement('h4');
      responsesTitle.textContent = 'Respuestas:';
      detailsContainer.appendChild(responsesTitle);

      data.responses.forEach((response, index) => {
        const responseElement = document.createElement('p');
        responseElement.textContent = `Respuesta ${index + 1}: ${response.text}`;
        detailsContainer.appendChild(responseElement);
      });
    } else {
      const noResponsesElement = document.createElement('p');
      noResponsesElement.textContent = 'No hay respuestas aún.';
      detailsContainer.appendChild(noResponsesElement);
    }

    // Añadir un campo de entrada y un botón para nuevas respuestas
    const responseInput = document.createElement('input');
    responseInput.type = 'text';
    responseInput.placeholder = 'Escribe tu respuesta aquí';
    responseInput.id = 'responseInput';

    const submitResponseButton = document.createElement('button');
    submitResponseButton.textContent = 'Enviar Respuesta';
    submitResponseButton.addEventListener('click', async () => {
      const responseText = responseInput.value.trim();
      if (responseText) {
        await addResponseToDatabase(discussionId, responseText);
        responseInput.value = ''; // Limpiar el campo de entrada
        await displayDiscussionDetails(discussionId); // Recargar los detalles para incluir la nueva respuesta
      } else {
        alert('La respuesta no puede estar vacía.');
      }
    });

    detailsContainer.appendChild(responseInput);
    detailsContainer.appendChild(submitResponseButton);

  } else {
    console.log("No se encontró la discusión.");
  }
}


async function addResponseToDatabase(discussionId, responseText) {
  const discussionRef = doc(db, "forum", discussionId);

  try {
    await updateDoc(discussionRef, {
      responses: arrayUnion({
        text: responseText,
        createdAt: new Date()
      })
    });
    console.log("Respuesta añadida correctamente.");
  } catch (error) {
    console.error("Error al añadir la respuesta:", error);
  }
}






// Escucha el evento 'submit' del formulario
document.getElementById('discussionForm').addEventListener('submit', (event) => {
  event.preventDefault();
  
  // Obtén los valores de los inputs y selects
  const titleInput = document.getElementById('discussionTitle');
  const bodyInput = document.getElementById('discussionBody'); // Captura la descripción
  const topicSelect = document.getElementById('discussionTopic');
  const citiesSelect = document.getElementById('citiesSelect');
  
  // Almacena los valores en variables
  const title = titleInput.value;
  const body = bodyInput.value; // Almacena el valor de la descripción
  const topic = topicSelect.value;
  const city = citiesSelect.value;
  
  // Llama a addDiscussion pasando la descripción como argumento
  addDiscussion(title, topic, city, body); // Añade 'body' como un nuevo argumento
  
  // Limpia los campos del formulario
  titleInput.value = "";
  bodyInput.value = ""; // Limpia el input de la descripción
  topicSelect.value = "dinero";
  citiesSelect.selectedIndex = 0;
});



document.getElementById('showFormButton').addEventListener('click', function() {
  var formContainer = document.getElementById('discussionFormContainer');
  if (formContainer.style.display === "none") {
      formContainer.style.display = "block";
      this.textContent = "Cancelar Creación";
  } else {
      formContainer.style.display = "none";
      this.textContent = "Crear Nueva Discusión";
  }
});


async function updateCitiesSelect() {
  // Obtén el elemento select para ciudades
  const citiesSelect = document.getElementById('citiesSelect');
  citiesSelect.innerHTML = ''; // Limpiar antes de añadir nuevas opciones

  try {
    const citiesSet = new Set(); // Usar un Set para mantener ciudades únicas
    const querySnapshot = await getDocs(collection(db, "destinos"));

    querySnapshot.forEach((doc) => {
      // Asumiendo que cada documento tiene un campo 'ciudad'
      const data = doc.data();
      if (data.ciudad) {
        citiesSet.add(data.ciudad);
      }
    });

    citiesSet.forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citiesSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener las ciudades: ", error);
  }
}


// Escucha el evento 'click' del contenedor que funciona como botón
document.querySelector('.header-container').addEventListener('click', function() {
  const formContainer = document.getElementById('discussionFormContainer');
  // Cambia el estilo de display basado en su estado actual
  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
});




// Añade la nueva función updateCitiesSelect para ser llamada cuando el contenido DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  showDiscussions();
  updateCitiesSelect(); // Llama a esta función también para actualizar el select de ciudades
});


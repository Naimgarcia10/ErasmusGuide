import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

// Plantillas
const universidadTemplate = document.getElementById('universidad-template').content;
const gradoTemplate = document.getElementById('grado-template').content;

// Función para obtener y mostrar los grados junto con las ciudades y universidades
async function displayGrados() {
  const gradosRef = doc(db, 'destinos_2', 'Grados');
  const gradosSnap = await getDoc(gradosRef);
  const gradoSelect = document.getElementById('grado-select'); // Obtén el elemento select

  if (gradosSnap.exists()) {
    const gradosData = gradosSnap.data();

    // Llenar el desplegable con los nombres de los grados
    Object.entries(gradosData).forEach(([gradoNombre, _]) => {
      const option = document.createElement('option');
      option.value = gradoNombre;
      option.textContent = gradoNombre;
      gradoSelect.appendChild(option);
    });

    const gradosContainer = document.getElementById('grados-container');
    gradosContainer.innerHTML = ''; // Limpiar el contenedor

    gradoSelect.addEventListener('change', (e) => {
      const selectedGrado = e.target.value;
      gradosContainer.innerHTML = ''; // Limpiar el contenedor antes de mostrar los nuevos datos

      if (selectedGrado) {
        const ciudades = gradosData[selectedGrado];
        const gradoClone = gradoTemplate.cloneNode(true);
        gradoClone.querySelector('.grado-nombre').textContent = selectedGrado;

        ciudades.forEach(ciudad => {
          ciudad.Universidades.forEach(universidad => {
            const universidadClone = universidadTemplate.cloneNode(true);
            
            universidadClone.querySelector('.paises-disponibles').textContent=ciudad.Pais;
            gradoClone.querySelector('.universidades-container').appendChild(universidadClone);
          });
        });

        gradosContainer.appendChild(gradoClone);
      }
    });
  } else {
    console.log("No se encontraron los grados!");
  }
}

// Llamar a displayGrados cuando la ventana carga
window.addEventListener('load', () => {
  displayGrados();
});

import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

// Función para obtener y mostrar los grados en el select
async function displayGrados() {
  const gradoSelect = document.querySelector('.grado-select');

  try {
    const gradosRef = doc(db, 'asignaturas', 'Grados'); // Cambiado a la colección 'asignaturas'
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      const gradosData = gradosSnap.data();
      Object.keys(gradosData).forEach(gradoNombre => {
        const option = document.createElement('option');
        option.value = gradoNombre;
        option.textContent = gradoNombre;
        gradoSelect.appendChild(option);
      });
    } else {
      console.log("No se encontraron grados.");
    }
  } catch (error) {
    console.error("Error al obtener los grados: ", error);
  }
}

// Añade un event listener al select de grados para que actualice los países cuando se seleccione un grado
document.querySelector('.grado-select').addEventListener('change', async (e) => {
  const selectedGrado = e.target.value;
  const countrySelect = document.querySelector('.country-select');
  countrySelect.innerHTML = '<option value="">Selecciona el Pais</option>'; // Limpiar el select de países

  if (selectedGrado) {
    const gradosRef = doc(db, 'asignaturas', 'Grados'); // Cambiado a la colección 'asignaturas'
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      const gradoData = gradosSnap.data()[selectedGrado];
      const paises = Object.keys(gradoData); // Obtiene todos los países disponibles para ese grado
      
      paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais;
        option.textContent = pais;
        countrySelect.appendChild(option); // Añade cada país como opción en el select de países
      });
    }
  }
});


document.querySelector('.country-select').addEventListener('change', async (e) => {
  const selectedCountry = e.target.value; // Corrige el nombre de la variable para seguir las convenciones
  const citySelect = document.querySelector('.city-select');
  citySelect.innerHTML = '<option value="">Selecciona la ciudad</option>'; // Limpiar el select de ciudades

  if (selectedCountry) {
    const gradosRef = doc(db, 'asignaturas', 'Grados');
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      const selectedGrado = document.querySelector('.grado-select').value;
      const gradoData = gradosSnap.data()[selectedGrado] || {};
      const paisData = gradoData[selectedCountry];

      if (paisData) {
        const ciudades = Object.keys(paisData); // Obtiene todas las ciudades disponibles para ese país
      
        ciudades.forEach(ciudad => {
          const option = document.createElement('option');
          option.value = ciudad;
          option.textContent = ciudad;
          citySelect.appendChild(option); // Añade cada ciudad como opción en el select de ciudades
        });
      }
    }
  }
});


document.querySelector('.city-select').addEventListener('change', async (e) => {
  const selectedCity = e.target.value;
  const universitySelect = document.querySelector('.university-select');
  universitySelect.innerHTML = '<option value="">Selecciona una universidad</option>'; // Limpiar el select de universidades

  if (selectedCity) {
    const gradoSelect = document.querySelector('.grado-select');
    const selectedGrado = gradoSelect.value;
    const countrySelect = document.querySelector('.country-select');
    const selectedCountry = countrySelect.value;

    const gradosRef = doc(db, 'asignaturas', 'Grados');
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      const gradoData = gradosSnap.data()[selectedGrado] || {};
      const paisData = gradoData[selectedCountry] || {};
      const ciudadData = paisData[selectedCity];

      // La ciudad ya no es un array, sino un objeto con universidades como claves
      if (ciudadData) {
        Object.keys(ciudadData).forEach(universidad => {
          const option = document.createElement('option');
          option.value = universidad; // El nombre de la universidad es la clave en este objeto
          option.textContent = universidad; // Asumiendo que el nombre de la universidad se puede usar directamente
          universitySelect.appendChild(option);
        });
      }
    }
  }
});


/*Aqui debajo van las asignaturas*/

document.querySelector('.university-select').addEventListener('change', async (e) => {
  const selectedUniversity = e.target.value;
  const gradoSelect = document.querySelector('.grado-select');
  const selectedGrado = gradoSelect.value;
  const countrySelect = document.querySelector('.country-select');
  const selectedCountry = countrySelect.value;
  const citySelect = document.querySelector('.city-select');
  const selectedCity = citySelect.value;

  sessionStorage.setItem('selectedUniversity', selectedUniversity);
  sessionStorage.setItem('selectedGrado', selectedGrado);
  sessionStorage.setItem('selectedCountry', selectedCountry);
  sessionStorage.setItem('selectedCity', selectedCity);

  // Limpia los selects de asignaturas y convalidaciones antes de llenarlos
  for (let i = 1; i <= 3; i++) {  // Ajusta el 3 al número de selects que tengas
    document.getElementById(`asignaturaEspaña${i}`).innerHTML = '';
    document.getElementById(`convalidacionErasmus${i}`).innerHTML = '';
  }

  try {
    const gradosRef = doc(db, 'asignaturas', 'Grados');
    const gradosSnap = await getDoc(gradosRef);

    if (gradosSnap.exists()) {
      const asignaturasData = gradosSnap.data()[selectedGrado][selectedCountry][selectedCity][selectedUniversity].Asignaturas;

      // Suponiendo que las asignaturas son un arreglo en el documento de Firestore
      if (asignaturasData) {
        for (let i = 1; i <= 3; i++) {  // Ajusta el 3 al número de selects que tengas
          const selectAsignaturaEspaña = document.getElementById(`asignaturaEspaña${i}`);
          const selectConvalidacionErasmus = document.getElementById(`convalidacionErasmus${i}`);
          
          // Añadir opción por defecto
          selectAsignaturaEspaña.appendChild(new Option('Selecciona una Asignatura', ''));
          selectConvalidacionErasmus.appendChild(new Option('Selecciona la Convalidación', ''));
          
          asignaturasData.forEach(asignatura => {
            // Llenar el select de asignatura en España
            selectAsignaturaEspaña.appendChild(new Option(asignatura.Nombre, asignatura.Nombre));
            // Llenar el select de convalidación Erasmus
            selectConvalidacionErasmus.appendChild(new Option(asignatura.ConvalidacionErasmus, asignatura.ConvalidacionErasmus));
          });
        }
      }
    } else {
      console.log("No se encontraron asignaturas para la universidad seleccionada.");
    }
  } catch (error) {
    console.error("Error al obtener las asignaturas de la universidad seleccionada:", error);
  }
});






document.addEventListener('DOMContentLoaded', displayGrados);
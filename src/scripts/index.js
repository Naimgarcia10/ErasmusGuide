import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {
  collection, getDocs, getFirestore
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { db } = initializeFirebase();

// Inicializa el mapa
var mapa = L.map('mapa').setView([42.55268700457353, 12.431455863032317], 4);  // Centro de Europa aproximadamente
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(mapa);

// Función para cargar marcadores desde Firestore
async function cargarMarcadores() {
  const querySnapshot = await getDocs(collection(db, "destinos"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const coords = data.Coordenadas.split(",");  // Asume que las coordenadas están en formato "lat,lng"
    L.marker([parseFloat(coords[0]), parseFloat(coords[1])]).addTo(mapa)
      .bindPopup(`Nombre: ${doc.id}<br>Ciudad: ${data.Ciudad}<br>Estudios: ${data.Estudios}<br>Idioma de impartición: ${data.IdiomaImparticion}<br>País: ${data.Pais}`)
      .openPopup();
  });
}

// Llamar a la función cargarMarcadores al cargar la página
cargarMarcadores();

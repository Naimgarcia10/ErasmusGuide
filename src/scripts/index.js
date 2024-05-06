// Importa las funciones necesarias para la conexión con Firebase y la manipulación de Firestore
import { initializeFirebase } from "../firebase/firebaseConnection.js";
import {collection, doc, getDoc, updateDoc,setDoc, deleteDoc, getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const {db } = initializeFirebase();

// Inicializar el mapa
var mapa = L.map('mapa').setView([44.800918087917225, 10.325879738603822], 4); // Establece la ubicación inicial y el nivel de zoom

// Agregar capa de mapa base (puedes usar diferentes proveedores de mapas)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(mapa);

//UNIVERSIDAD DE PARMA
L.marker([44.800918087917225, 10.325879738603822]).addTo(mapa)
.bindPopup("Nombre: Universidad de Parma<br>Ciudad: Parma<br>Estudios: Derecho<br>Idioma de imparticion: Italiano").openPopup();

//UNIVERSIDAD AGH KRAKOW
L.marker([50.06464067476525, 19.92336102727471]).addTo(mapa)
.bindPopup("Nombre: Universidad AGH<br>Ciudad: Cracovia<br>Estudios: Informatica, Derecho<br>Idioma de imparticion: Ingles").openPopup();

L.marker([48.85884430000001, 2.2943506]).addTo(mapa)
.bindPopup("Nombre: Universidad de Paris<br>Ciudad: Paris<br>Estudios: Arquitectura<br>Idioma de imparticion: Frances").openPopup();

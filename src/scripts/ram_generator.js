import { initializeFirebase } from "../firebase/firebaseConnection.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicializa Firebase
const { app, db } = initializeFirebase();

const inputApellidos = document.getElementById('apellidos');
const inputNombre = document.getElementById('nombre');
const inputDNI = document.getElementById('dni');
const inputCodDestino = document.getElementById('cod-destino');
const inputNombreCoord = document.getElementById('nombre-coord');
const inputEmailCoord = document.getElementById('email-coord');
const ram_btn = document.getElementById('ram-btn');

ram_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const apellidos = inputApellidos.value;
    const nombre = inputNombre.value;
    const dni = inputDNI.value;
    const codDestino = inputCodDestino.value;
    const nombreCoord = inputNombreCoord.value;
    const emailCoord = inputEmailCoord.value;
    const split_nombre = nombre.split(' ');
    var nombre_;
    if (split_nombre.length < 2) {
        nombre_ = split_nombre[0];
    }else{
        nombre_ = split_nombre[0] + '_' + split_nombre[1];
    }
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    const fecha_actual = `${dia}/${mes}/${año}`;

    var selectoresAsignaturaEspaña = [];
    var selectoresConvalidacionErasmus = [];
    var asignaturaEspañaSeleccionada, convalidacionErasmusSeleccionada;

    for (let i = 1; i <= 3; i++) {
        const asignaturaEspaña = document.getElementById(`asignaturaEspaña${i}`);
        const convalidacionErasmus = document.getElementById(`convalidacionErasmus${i}`);

        asignaturaEspañaSeleccionada = asignaturaEspaña.options[asignaturaEspaña.selectedIndex].text;
        convalidacionErasmusSeleccionada = convalidacionErasmus.options[convalidacionErasmus.selectedIndex].text;

        selectoresAsignaturaEspaña.push(asignaturaEspañaSeleccionada);
        selectoresConvalidacionErasmus.push(convalidacionErasmusSeleccionada);
    }

    selectoresAsignaturaEspaña = selectoresAsignaturaEspaña.filter(item => item !== "Selecciona una Asignatura");
    selectoresConvalidacionErasmus = selectoresConvalidacionErasmus.filter(item => item !== "Selecciona la Convalidación");

    const gradosRef = doc(db, 'asignaturas', 'Grados');
    const gradosSnap = await getDoc(gradosRef);
    const gradosData = gradosSnap.data();

    const titulacion = sessionStorage.getItem('selectedGrado');
    const pais = sessionStorage.getItem('selectedCountry');
    const ciudad = sessionStorage.getItem('selectedCity');
    const universidad = sessionStorage.getItem('selectedUniversity');

    var data = {
        "[titulacion]": titulacion, 
        "[apellidos]": apellidos,
        "[nombre]": nombre,
        "[DNI]": dni,
        "[codigo_erasmus]": codDestino,
        "[nombre_coord]": nombreCoord,
        "[email_coord]": emailCoord,
        "[fecha]": fecha_actual,
        
    };    
    
    for (let i = 1; i <= selectoresAsignaturaEspaña.length; i++) {
        data[`[nombre_ulpgc_${i}]`] = selectoresAsignaturaEspaña[i - 1];
        data[`[cod_ulpgc_${i}]`] = String(gradosData[titulacion][pais][ciudad][universidad]["Asignaturas"][i - 1]["code_origin"]);
        data[`[ects_ulpgc_${i}]`] = String(gradosData[titulacion][pais][ciudad][universidad]["Asignaturas"][i - 1]["ects_origin"]);
        data[`[nombre_dest_${i}]`] = selectoresConvalidacionErasmus[i - 1];
        data[`[cod_dest_${i}]`] = String(gradosData[titulacion][pais][ciudad][universidad]["Asignaturas"][i - 1]["code_destiny"]);
        data[`[ects_dest_${i}]`] = String(gradosData[titulacion][pais][ciudad][universidad]["Asignaturas"][i - 1]["ects_destiny"]);
    }
    
    for (let i = selectoresAsignaturaEspaña.length + 1; i <= 10; i++) {
        data[`[nombre_ulpgc_${i}]`] = "";
        data[`[cod_ulpgc_${i}]`] = "";
        data[`[ects_ulpgc_${i}]`] = "";
        data[`[nombre_dest_${i}]`] = "";
        data[`[cod_dest_${i}]`] = "";
        data[`[ects_dest_${i}]`] = "";
    }

    fetch('http://127.0.0.1:5000/generate_docx', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.blob())
    .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = `ram_${nombre_}.docx`;
        a.click();
    }); 
});

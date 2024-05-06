function pintarEstrellas() {
  const stars = document.querySelectorAll(".star");

  stars.forEach(function (star, index) {
    star.addEventListener("click", function () {
      // Pintar la estrella clicada y todas las de su izquierda de dorado
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add("checked");
      }

      // Quitar la clase "checked" de todas las estrellas a la derecha de la clicada
      for (let i = index + 1; i < stars.length; i++) {
        stars[i].classList.remove("checked");
      }
    });
  });
}

// Llamar a la función pintarEstrellas después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  pintarEstrellas();
});

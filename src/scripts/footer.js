document.addEventListener("DOMContentLoaded", function() {
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("body").innerHTML += data;
            // Opcionalmente, podrías querer aplicar el CSS dinámicamente también
            const cssLink = document.createElement("link");
            cssLink.href = "../styles/footer.css";
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css";
            document.head.appendChild(cssLink);
        });
});

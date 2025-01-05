let timer = 0; // Variable para rastrear el tiempo
let timerInterval;

const button = document.getElementById("blindButton");
const result = document.getElementById("result");
const history = document.getElementById("history");

// Backend URL (actualízalo con tu backend)
const backendUrl = "https://juego-backend.onrender.com";

// Iniciar el temporizador cuando se presiona el botón
button.addEventListener("mousedown", () => {
  timer = 0; // Reiniciar el temporizador
  result.classList.add("hidden"); // Ocultar el resultado previo
  timerInterval = setInterval(() => {
    timer += Math.random() > 0.5 ? 1 : -1; // Aumentar o disminuir el tiempo aleatoriamente
  }, 100); // Intervalo de 100ms
});

// Detener el temporizador y mostrar el resultado
button.addEventListener("mouseup", () => {
  clearInterval(timerInterval); // Detener el temporizador

  // Determinar premio o castigo basado en el tiempo
  let outcome;
  if (timer < -5) {
    outcome = "¡Castigo severo!";
  } else if (timer >= -5 && timer <= 5) {
    outcome = "¡Te salvaste esta vez!";
  } else {
    outcome = "¡Premio increíble!";
  }

  // Mostrar el resultado
  result.textContent = `Tu tiempo final es ${timer}. Resultado: ${outcome}`;
  result.classList.remove("hidden");

  // Añadir al historial local
  const historyItem = document.createElement("li");
  historyItem.textContent = `Tiempo: ${timer}, Resultado: ${outcome}`;
  history.appendChild(historyItem);

  // Enviar los datos al backend
  fetch(`${backendUrl}/resultados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tiempo: timer, resultado: outcome }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Resultado guardado:", data))
    .catch((error) => console.error("Error al guardar el resultado:", error));
});

// Cargar el historial al iniciar
window.onload = () => {
  fetch(`${backendUrl}/resultados`)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        const historyItem = document.createElement("li");
        historyItem.textContent = `Tiempo: ${item.tiempo}, Resultado: ${
          item.resultado
        }, Fecha: ${new Date(item.fecha).toLocaleString()}`;
        history.appendChild(historyItem);
      });
    })
    .catch((error) => console.error("Error al cargar el historial:", error));
};

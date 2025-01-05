let timer = 0; // Variable para rastrear el tiempo
let timerInterval;
let targetTime = 0; // Tiempo objetivo en milisegundos
let lastTargetTime = -1; // Guardar el último tiempo objetivo para evitar repetidos

const button = document.getElementById("blindButton");
const resultBox = document.getElementById("resultBox");
const result = document.getElementById("result");
const history = document.getElementById("history");
const objective = document.getElementById("objective");

// Backend URL
const backendUrl = "https://juego-backend.onrender.com";

// Generar un tiempo objetivo aleatorio entre 1 y 10 segundos (evitar repetidos)
function generateTargetTime() {
  do {
    targetTime = Math.floor(Math.random() * 10 + 1) * 1000; // En milisegundos
  } while (targetTime === lastTargetTime); // Evitar el mismo objetivo
  lastTargetTime = targetTime; // Guardar el nuevo objetivo

  objective.textContent = `Tu objetivo es mantener el botón presionado durante ${targetTime / 1000} segundos. ¡Prepárate!`;
}

// Iniciar el temporizador cuando se presiona el botón
button.addEventListener("mousedown", () => {
  timer = 0; // Reiniciar el temporizador
  resultBox.classList.add("hidden"); // Ocultar el cuadro del resultado
  resultBox.textContent = ""; // Limpiar el texto del cuadro
  timerInterval = setInterval(() => {
    timer += 100; // Incrementar el temporizador cada 100 ms
  }, 100); // Intervalo de 100 ms
});

// Detener el temporizador y mostrar el resultado
button.addEventListener("mouseup", () => {
  clearInterval(timerInterval); // Detener el temporizador

  // Calcular la diferencia entre el tiempo objetivo y el tiempo real
  const difference = Math.abs(targetTime - timer);

  // Determinar el resultado basado en la diferencia
  let outcome;
  if (difference <= 200) {
    outcome = `¡Ganaste! Precisión: ${difference} ms.`;
    resultBox.className = "win"; // Estilo verde
  } else {
    outcome = `¡Perdiste! Diferencia: ${difference} ms.`;
    resultBox.className = "lose"; // Estilo rojo
  }

  // Mostrar el cuadro del resultado
  resultBox.textContent = `${outcome} ¡Intenta de nuevo!`;
  resultBox.style.display = "block";

  // Añadir al historial local (mantener solo los últimos 5 resultados)
  const historyItem = document.createElement("li");
  historyItem.textContent = `Objetivo: ${targetTime / 1000} s, Real: ${timer / 1000} s, ${outcome}`;
  history.prepend(historyItem);
  if (history.childElementCount > 5) {
    history.removeChild(history.lastChild); // Eliminar el más antiguo
  }

  // Enviar los datos al backend
  fetch(`${backendUrl}/resultados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tiempoObjetivo: targetTime / 1000,
      tiempoReal: timer / 1000,
      resultado: outcome,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Resultado guardado:", data))
    .catch((error) => console.error("Error al guardar el resultado:", error));

  // Generar un nuevo objetivo para la siguiente ronda
  generateTargetTime();
});

// Cargar el historial al iniciar
window.onload = () => {
  fetch(`${backendUrl}/resultados`)
    .then((response) => response.json())
    .then((data) => {
      data.slice(-5).forEach((item) => {
        const historyItem = document.createElement("li");
        historyItem.textContent = `Objetivo: ${item.tiempoObjetivo} s, Real: ${item.tiempoReal} s, ${item.resultado}`;
        history.prepend(historyItem);
      });
    })
    .catch((error) => console.error("Error al cargar el historial:", error));

  // Generar el primer objetivo
  generateTargetTime();
};

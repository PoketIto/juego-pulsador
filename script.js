let timer = 0; // Variable para rastrear el tiempo
let timerInterval;
let targetTime = 0; // Tiempo objetivo en milisegundos

const button = document.getElementById("blindButton");
const result = document.getElementById("result");
const history = document.getElementById("history");

// Backend URL (actualiza con tu backend si es necesario)
const backendUrl = "https://juego-backend.onrender.com";

// Generar un tiempo objetivo aleatorio entre 1 y 10 segundos
function generateTargetTime() {
  targetTime = Math.floor(Math.random() * 10 + 1) * 1000; // En milisegundos
  console.log(`Nuevo tiempo objetivo: ${targetTime} ms`); // Para depuración
}

// Iniciar el temporizador cuando se presiona el botón
button.addEventListener("mousedown", () => {
  generateTargetTime(); // Generar un nuevo tiempo objetivo
  timer = 0; // Reiniciar el temporizador
  result.textContent = `Tu objetivo es ${targetTime / 1000} segundos.`; // Mostrar objetivo
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
    outcome = `¡Ganaste! Diferencia: ${difference} ms.`;
  } else {
    outcome = `¡Perdiste! Diferencia: ${difference} ms.`;
  }

  // Mostrar el resultado
  result.textContent = `Tu tiempo fue ${timer / 1000} segundos. ${outcome}`;

  // Añadir al historial local
  const historyItem = document.createElement("li");
  historyItem.textContent = `Tiempo objetivo: ${targetTime / 1000} s, Tiempo real: ${timer / 1000} s, Resultado: ${outcome}`;
  history.appendChild(historyItem);

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
});

// Cargar el historial al iniciar
window.onload = () => {
  fetch(`${backendUrl}/resultados`)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        const historyItem = document.createElement("li");
        historyItem.textContent = `Tiempo objetivo: ${item.tiempoObjetivo} s, Tiempo real: ${item.tiempoReal} s, Resultado: ${item.resultado}`;
        history.appendChild(historyItem);
      });
    })
    .catch((error) => console.error("Error al cargar el historial:", error));
};

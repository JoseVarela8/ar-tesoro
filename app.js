// -------- Estado y elementos --------
const FOUND_KEY = "ar-found";
const found = new Set(JSON.parse(localStorage.getItem(FOUND_KEY) || "[]"));
const countEl = document.getElementById("count");
const treasure = document.getElementById("treasure");
const startBtn = document.getElementById("startBtn");
let audioReady = false;

// -------- Inicialización --------
updateCount();
maybeRevealTreasure();

// Habilitar audio (iOS requiere interacción del usuario)
startBtn.addEventListener("click", async () => {
  try {
    const winSound = document.querySelector("#winSound");
    await winSound.components.sound.playSound();
    winSound.components.sound.stopSound();
    audioReady = true;
    startBtn.disabled = true;
    startBtn.textContent = "🎧 Listo";
  } catch (e) {
    console.warn("No se pudo iniciar audio aún:", e);
  }
});

// -------- Utilidades --------
function saveFound() {
  localStorage.setItem(FOUND_KEY, JSON.stringify([...found]));
}

function updateCount() {
  if (countEl) countEl.textContent = String(found.size);
}

function maybeRevealTreasure() {
  if (!treasure) return;
  if (found.size >= 3) {
    treasure.setAttribute("visible", "true");
    const winSound = document.querySelector("#winSound");
    if (audioReady && winSound?.components?.sound) {
      winSound.components.sound.playSound();
    }
  } else {
    treasure.setAttribute("visible", "false");
  }
}

// -------- Suscripción a marcadores --------
const markerIds = ["m1", "m2", "m3"];
const scene = document.querySelector("a-scene");

function registerMarkers() {
  const present = markerIds.filter(id => document.getElementById(id));
  console.log("Marcadores registrados:", present);

  present.forEach((id) => {
    const marker = document.getElementById(id);
    if (!marker || marker.__listenerAdded) return; // evita duplicados

    marker.__listenerAdded = true;

    marker.addEventListener("markerFound", () => {
      if (!found.has(id)) {
        found.add(id);
        saveFound();
        updateCount();
        maybeRevealTreasure();
        if (navigator.vibrate) navigator.vibrate(60);
      }
    });
  });
}

// Esperar a que la escena cree el DOM interno antes de enganchar eventos
if (scene) {
  if (scene.hasLoaded) registerMarkers();
  else scene.addEventListener("loaded", registerMarkers);
} else {
  console.warn("No se encontró <a-scene> en el DOM.");
}

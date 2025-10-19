// Guardamos progreso localmente (por si refrescan)
const FOUND_KEY = "ar-found";
const found = new Set(JSON.parse(localStorage.getItem(FOUND_KEY) || "[]"));
const countEl = document.getElementById("count");
const treasure = document.getElementById("treasure");
const startBtn = document.getElementById("startBtn");
let audioReady = false;

updateCount();
maybeRevealTreasure();

// iOS/Safari: hay que habilitar audio con un toque
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

function saveFound() {
  localStorage.setItem(FOUND_KEY, JSON.stringify([...found]));
}
function updateCount() {
  countEl.textContent = String(found.size);
}
function maybeRevealTreasure() {
  if (found.size >= 3) {
    treasure.setAttribute("visible", "true");
    const winSound = document.querySelector("#winSound");
    if (audioReady) winSound.components.sound.playSound();
  }
}

// Escuchamos cuando se encuentra cada marcador
["m1", "m2", "m3"].forEach((id) => {
  const marker = document.getElementById(id);
  marker.addEventListener("markerFound", () => {
    if (!found.has(id)) {
      found.add(id);
      saveFound();
      updateCount();
      maybeRevealTreasure();

      // Vibración suave (Android)
      if (navigator.vibrate) navigator.vibrate(60);
    }
  });
});

// Para “borrar” progreso si necesitás probar de nuevo:
// window.resetProgress = () => { localStorage.removeItem(FOUND_KEY); location.reload(); };

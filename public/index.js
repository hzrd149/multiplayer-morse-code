import { setGraphValue } from "./canvas.js";
const MORSE_CODES = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  0: "-----",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "!": "-.-.--",
  "@": ".--.-.",
};

const wsUrl = new URL(location.href);
wsUrl.protocol = wsUrl.protocol === "http:" ? "ws" : "wss";
const ws = new WebSocket(wsUrl.toString());

ws.onmessage = ({ data }) => setSignal(parseInt(data) || 0);

let cache = null;
function getGain() {
  if (!cache) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    gain.gain.value = 0;
    oscillator.frequency.value = 700;
    oscillator.connect(gain);

    oscillator.start(0);
    gain.connect(context.destination);

    cache = gain;
  }

  return cache;
}

function setSignal(v = 0) {
  setGain(v);
  setGraphValue(v);
}

let safety = null;
const setGain = (v = 0) => {
  if (safety) clearTimeout(safety);
  const gain = getGain();
  gain.gain.value = v;

  // if 1 is set. send a 0 at least 500ms after
  if (v === 1) {
    safety = setTimeout(() => (gain.gain.value = 0), 500);
  }
};

const high = () => {
  ws.send(String(1));
  setSignal(1);
};
const low = () => {
  ws.send(String(0));
  setSignal(0);
};

window.addEventListener("mousedown", getGain, { once: true });
window.addEventListener("keydown", getGain, { once: true });

// simple switch
let keyDown = false;
window.addEventListener("keydown", (event) => {
  if (!keyDown) {
    keyDown = true;
    switch (event.code) {
      case "KeyC":
        high();
        break;
      case "KeyX":
        high();
        setTimeout(() => low(), 80);
        break;
      case "KeyZ":
        high();
        setTimeout(() => low(), 80 * 3);
        break;
    }
  }
});
window.addEventListener("keyup", (event) => {
  keyDown = false;
  if (event.code === "KeyC") {
    low();
  }
});

const button = document.getElementById("switch");
button.addEventListener("mousedown", () => high());
button.addEventListener("mouseup", () => low());
button.addEventListener("touchstart", () => high());
button.addEventListener("touchend", () => low());

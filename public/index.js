import { setGraphValue } from "./canvas.js";
const now = () => new Date().valueOf();
const delay = (t = 100) => new Promise((res) => setTimeout(res, t));

const wsUrl = new URL(location.href);
wsUrl.protocol = wsUrl.protocol === "http:" ? "ws" : "wss";
const ws = new WebSocket(wsUrl.toString());

ws.onmessage = ({ data }) => {
  const sequence = JSON.parse(data);
  playSequence(sequence);
};

const context = new AudioContext();
const oscillator = context.createOscillator();
const gainStep = context.createGain();
gainStep.gain.value = 0;
oscillator.frequency.value = 600;
oscillator.connect(gainStep);

oscillator.start(0);
gainStep.connect(context.destination);

function resumeAudio() {
  if (context.state === "suspended") {
    context.resume();
  }
}

function setSignal(v = 0) {
  resumeAudio();
  gainStep.gain.value = v;
  setGraphValue(v);
}
async function playSequence(sequence = []) {
  let v = 1;
  setSignal(1);
  for (const t of sequence) {
    await delay(t);
    v = v ? 0 : 1;
    setSignal(v);
  }
  setSignal(0);
}

let queue = [];
let recording = false;
const flush = () => {
  if (queue.length > 0) {
    console.log(queue);
    ws.send(JSON.stringify(queue));
  }
  queue = [];
  recording = false;
};

let flushTimeout = null;
const pushTimeToQueue = (t) => {
  recording = true;
  queue.push(t);

  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flush, 600);
};

let lastTime = now();
const toggleSignal = () => {
  const t = now();
  if (recording) pushTimeToQueue(t - lastTime);
  recording = true;
  lastTime = t;
};

let state = 0;
function setState(s = 0) {
  if (s !== state) {
    state = s;
    toggleSignal();
    setSignal(state);
  }
}

let safety = null;
const low = () => {
  setState(0);
  if (safety) clearTimeout(safety);
};
const high = () => {
  if (safety) clearTimeout(safety);
  setState(1);
  safety = setTimeout(low, 500);
};

// const dotTime = 80;
// const dot = () => {
//   pushTimeToQueue(dotTime);
//   pushTimeToQueue(dotTime);
// };
// const dash = () => {
//   pushTimeToQueue(dotTime * 3);
//   pushTimeToQueue(dotTime);
// };

// simple switch
let keyDown = false;
window.addEventListener("keydown", (event) => {
  if (!keyDown) {
    keyDown = true;
    switch (event.code) {
      case "KeyC":
        high();
        break;
    }
  }
});
window.addEventListener("keyup", (event) => {
  keyDown = false;
  switch (event.code) {
    case "KeyC":
      low();
      break;
  }
});

const button = document.getElementById("switch");
if (navigator.maxTouchPoints > 0) {
  button.addEventListener("touchstart", () => high());
  button.addEventListener("touchend", () => low());
} else {
  button.addEventListener("mousedown", () => high());
  button.addEventListener("mouseup", () => low());
}

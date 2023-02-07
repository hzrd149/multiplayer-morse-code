const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

const top = Math.floor(canvas.height / 10);
const bottom = canvas.height - top;
const lineSize = 4;
const stepSize = lineSize / 2;

let value = 0;
export function setGraphValue(v) {
  value = v;
}

let prev = value;
function render() {
  ctx.drawImage(
    canvas,
    stepSize,
    0,
    canvas.width - stepSize,
    canvas.height,
    0,
    0,
    canvas.width - stepSize,
    canvas.height
  );
  ctx.fillStyle = "white";
  ctx.fillRect(canvas.width - stepSize, 0, stepSize, canvas.height);

  ctx.fillStyle = "black";
  if (prev !== value) {
    ctx.fillRect(canvas.width - lineSize, top, lineSize, bottom - top);
  } else {
    ctx.fillRect(
      canvas.width - lineSize,
      (value ? top : bottom) - lineSize / 2,
      lineSize,
      lineSize
    );
  }

  prev = value;

  requestAnimationFrame(render);
}
render();

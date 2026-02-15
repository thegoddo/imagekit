const remover = document.querySelector("background-remover");
const canvas = document.getElementById("final-canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("bg-color-picker");
const bgImageInput = document.getElementById("bg-image-input");
const downloadBtn = document.getElementById("download-btn");
const toolsArea = document.getElementById("custom-bg-tools");
const sizeSlider = document.getElementById("brush-size");

// Offscreen canvas to track manual removals
const maskCanvas = document.createElement("canvas");
const maskCtx = maskCanvas.getContext("2d");

let foregroundImage = null;
let backgroundImage = null;
let isDrawing = false;
let currentTool = "brush"; // 'brush' or 'rect'

remover.addEventListener(
  "@ligrila/background-remover/image-processed",
  async (e) => {
    foregroundImage = await createImageBitmap(e.detail.blob);
    maskCanvas.width = foregroundImage.width;
    maskCanvas.height = foregroundImage.height;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    toolsArea.style.display = "block";
    drawFinal();
  },
);

canvas.onmousedown = (e) => {
  isDrawing = true;
  handleManual(e);
};
canvas.onmousemove = (e) => {
  if (isDrawing) handleManual(e);
};
canvas.onmouseup = () => {
  isDrawing = false;
  maskCtx.beginPath();
};

function handleManual(e) {
  if (!foregroundImage) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const size = parseInt(sizeSlider.value);

  maskCtx.globalCompositeOperation = "source-over";
  maskCtx.fillStyle = "black";

  if (currentTool === "brush") {
    maskCtx.lineTo(x, y);
    maskCtx.lineWidth = size;
    maskCtx.lineCap = "round";
    maskCtx.stroke();
  } else if (currentTool === "rect") {
    maskCtx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  drawFinal();
}

function drawFinal() {
  if (!foregroundImage) return;
  canvas.width = foregroundImage.width;
  canvas.height = foregroundImage.height;

  // Layer 1: Background
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = colorPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw subject to a temp canvas first to apply mask
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tCtx = tempCanvas.getContext("2d");

  tCtx.drawImage(foregroundImage, 0, 0);
  tCtx.globalCompositeOperation = "destination-out"; // This erases pixels
  tCtx.drawImage(maskCanvas, 0, 0);

  ctx.drawImage(tempCanvas, 0, 0);
}

// UI Handlers
document.getElementById("btn-brush").onclick = () => {
  currentTool = "brush";
  updateToolBtns("btn-brush");
};
document.getElementById("btn-rect").onclick = () => {
  currentTool = "rect";
  updateToolBtns("btn-rect");
};
sizeSlider.oninput = () =>
  (document.getElementById("size-val").innerText = sizeSlider.value);

function updateToolBtns(activeId) {
  document
    .querySelectorAll(".tool-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(activeId).classList.add("active");
}

colorPicker.oninput = () => {
  backgroundImage = null;
  drawFinal();
};
bgImageInput.onchange = (e) => {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      backgroundImage = img;
      drawFinal();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

downloadBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = `subject-extract-${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
};

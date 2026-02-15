const remover = document.querySelector("background-remover");
const canvas = document.getElementById("final-canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("bg-color-picker");
const bgImageInput = document.getElementById("bg-image-input");
const downloadBtn = document.getElementById("download-btn");
const toolsArea = document.getElementById("custom-bg-tools");
const placeholder = document.getElementById("placeholder-text");

let foregroundImage = null; // The transparent cutout
let backgroundImage = null; // The custom user background

// 1. Listen for Ligrila's "Processed" Event
remover.addEventListener(
  "@ligrila/background-remover/image-processed",
  async (event) => {
    const { blob } = event.detail; // Ligrila provides the processed blob

    // Convert blob to an image we can draw on canvas
    foregroundImage = await createImageBitmap(blob);

    // Show UI and hide placeholder
    toolsArea.style.display = "block";
    placeholder.style.display = "none";

    drawFinal();
  },
);

// 2. Handle Color Wheel Change
colorPicker.addEventListener("input", () => {
  backgroundImage = null; // Clear background image if color is picked
  drawFinal();
});

// 3. Handle Background Image Upload
bgImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      backgroundImage = img;
      drawFinal();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 4. The Compositing Engine
function drawFinal() {
  if (!foregroundImage) return;

  // Match canvas to foreground image size
  canvas.width = foregroundImage.width;
  canvas.height = foregroundImage.height;

  // Layer 1: Draw Background
  if (backgroundImage) {
    // Scale background image to cover the canvas
    const scale = Math.max(
      canvas.width / backgroundImage.width,
      canvas.height / backgroundImage.height,
    );
    const x = canvas.width / 2 - (backgroundImage.width / 2) * scale;
    const y = canvas.height / 2 - (backgroundImage.height / 2) * scale;
    ctx.drawImage(
      backgroundImage,
      x,
      y,
      backgroundImage.width * scale,
      backgroundImage.height * scale,
    );
  } else {
    // Use the color from the wheel
    ctx.fillStyle = colorPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Layer 2: Draw the Transparent Subject
  ctx.drawImage(foregroundImage, 0, 0);
}

// 5. Download Function
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `creative-cutout-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

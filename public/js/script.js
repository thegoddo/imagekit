const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Filter inputs
const brightnessInput = document.getElementById("brightness");
const saturationInput = document.getElementById("saturation");
const inversionInput = document.getElementById("inversion");
const grayscaleInput = document.getElementById("grayscale");

const rotateLeftBtn = document.getElementById("rotate-left");
const rotateRightBtn = document.getElementById("rotate-right");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");

let currentImage = null;
let rotate = 0; // Rotation in degrees

// 1. Load Image
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    currentImage = img;
    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;
    applyFilters();
  };
});

// 2. Apply Filters & Draw
const applyFilters = () => {
  if (!currentImage) return;

  // Clear the canvas before redrawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save context state (so transformations don't stack infinitely)
  ctx.save();

  // Move to center, rotate, move back (standard canvas rotation logic)
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Apply CSS-style filters
  ctx.filter = `brightness(${brightnessInput.value}%) saturate(${saturationInput.value}%) invert(${inversionInput.value}%) grayscale(${grayscaleInput.value}%)`;

  // Draw the image
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

  // Restore context state
  ctx.restore();
};

// 3. Event Listeners for Sliders
[brightnessInput, saturationInput, inversionInput, grayscaleInput].forEach(
  (input) => {
    input.addEventListener("input", applyFilters);
  },
);

// 4. Rotation Logic
rotateLeftBtn.addEventListener("click", () => {
  rotate -= 90;
  applyFilters();
});

rotateRightBtn.addEventListener("click", () => {
  rotate += 90;
  applyFilters();
});

// 5. Reset Function
resetBtn.addEventListener("click", () => {
  brightnessInput.value = 100;
  saturationInput.value = 100;
  inversionInput.value = 0;
  grayscaleInput.value = 0;
  rotate = 0;
  applyFilters();
});

// 6. Save Image
saveBtn.addEventListener("click", () => {
  if (!currentImage) return;

  // Create a temporary link to download the canvas content
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL();
  link.click();
});

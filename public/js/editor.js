const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-container");

const brightnessInput = document.getElementById("brightness");
const saturationInput = document.getElementById("saturation");
const inversionInput = document.getElementById("inversion");
const grayscaleInput = document.getElementById("grayscale");

const rotateLeftBtn = document.getElementById("rotate-left");
const rotateRightBtn = document.getElementById("rotate-right");
const startCropBtn = document.getElementById("start-crop-btn");
const cropCutBtn = document.getElementById("crop-cut-btn");
const cropCancelBtn = document.getElementById("crop-cancel-btn");
const cropActions = document.getElementById("crop-actions");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");

let originalImageURL = null;
let currentImage = null;
let rotate = 0;
let cropper = null;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  originalImageURL = URL.createObjectURL(file);
  loadIterator(originalImageURL);
});

const loadIterator = (url) => {
  const img = new Image();
  img.src = url;
  img.onload = () => {
    currentImage = img;
    // resizeW.value = img.width;
    // resizeH.value = img.height;
    rotate = 0;
    resetFiltersOnly();
    draw();
  };
};

const draw = () => {
  if (!currentImage) return;

  const isRotated = rotate % 180 !== 0;
  const targetWidth = isRotated ? currentImage.height : currentImage.width;
  const targetHeight = isRotated ? currentImage.width : currentImage.height;

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);

  if (isRotated) {
    ctx.translate(-currentImage.height / 2, -currentImage.width / 2);
  } else {
    ctx.translate(-currentImage.width / 2, -currentImage.height / 2);
  }

  ctx.filter = `brightness(${brightnessInput.value}%) saturate(${saturationInput.value}%) invert(${inversionInput.value}%) grayscale(${grayscaleInput.value}%)`;

  ctx.drawImage(currentImage, 0, 0);
  ctx.restore();
};

[brightnessInput, saturationInput, inversionInput, grayscaleInput].forEach(
  (input) => {
    input.addEventListener("input", draw);
  },
);

rotateLeftBtn.addEventListener("click", () => {
  rotate -= 90;
  draw();
});
rotateRightBtn.addEventListener("click", () => {
  rotate += 90;
  draw();
});

startCropBtn.addEventListener("click", () => {
  if (!currentImage) return;

  const dataUrl = canvas.toDataURL();

  const cropImg = document.createElement("img");
  cropImg.src = dataUrl;
  cropImg.style.maxWidth = "100%";
  cropImg.id = "crop-image-target";

  canvas.style.display = "none";
  canvasContainer.appendChild(cropImg);

  cropper = new Cropper(cropImg, {
    viewMode: 1,
    background: false,
  });

  startCropBtn.style.display = "none";
  cropActions.style.display = "flex";
  disableFilters(true);
});

cropCutBtn.addEventListener("click", () => {
  if (!cropper) return;

  const croppedCanvas = cropper.getCroppedCanvas();

  const newImg = new Image();
  newImg.src = croppedCanvas.toDataURL();
  newImg.onload = () => {
    currentImage = newImg;
    // resizeW.value = newImg.width;
    // resizeH.value = newImg.height;

    destroyCropper();
    resetFiltersOnly();
    rotate = 0;
    draw();
  };
});

cropCancelBtn.addEventListener("click", () => {
  destroyCropper();
});

function destroyCropper() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  const cropImg = document.getElementById("crop-image-target");
  if (cropImg) cropImg.remove();

  canvas.style.display = "block";
  startCropBtn.style.display = "block";
  cropActions.style.display = "none";
  disableFilters(false);
}

function disableFilters(disabled) {
  const inputs = [
    brightnessInput,
    saturationInput,
    inversionInput,
    grayscaleInput,
    rotateLeftBtn,
    rotateRightBtn,
    // resizeBtn,
  ];
  inputs.forEach((el) => (el.disabled = disabled));
}

function resetFiltersOnly() {
  brightnessInput.value = 100;
  saturationInput.value = 100;
  inversionInput.value = 0;
  grayscaleInput.value = 0;
}

resetBtn.addEventListener("click", () => {
  if (originalImageURL) {
    destroyCropper();
    loadIterator(originalImageURL);
  }
});

saveBtn.addEventListener("click", () => {
  if (!currentImage) return;
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL();
  link.click();
});

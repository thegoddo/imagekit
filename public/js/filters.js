const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("main-canvas");
const viewport = document.getElementById("filter-viewport");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("download-btn");

let originalImage = null;
let currentFilterClass = "";

fileInput.onchange = (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage = new Image();
    originalImage.onload = () => {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

// Handle Preset Selection
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.onclick = () => {
    // Remove previous filter class
    if (currentFilterClass) viewport.classList.remove(currentFilterClass);

    // Add new filter class from CSSGram
    currentFilterClass = btn.dataset.class;
    viewport.classList.add(currentFilterClass);
  };
});

downloadBtn.onclick = () => {
  if (!originalImage) return;

  // To download with the filter, we must apply the computed style
  // of the viewport back to the canvas context
  const computedStyle = window.getComputedStyle(viewport);
  const filterString = computedStyle.getPropertyValue("filter");

  // Create a temporary canvas to "bake" the filter
  const tempCanvas = document.createElement("canvas");
  const tCtx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  tCtx.filter = filterString; // Apply the CSSGram filter string
  tCtx.drawImage(originalImage, 0, 0);

  const link = document.createElement("a");
  link.download = `filter_${currentFilterClass || "none"}.png`;
  link.href = tempCanvas.toDataURL();
  link.click();
};

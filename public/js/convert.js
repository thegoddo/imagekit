const fileInput = document.getElementById("file-input");
const convertBtn = document.getElementById("convert-btn");
const targetFormat = document.getElementById("target-format");
const qualitySlider = document.getElementById("quality-slider");
const qualityLabel = document.getElementById("quality-label");
const fileInfo = document.getElementById("file-info");
const outputMeta = document.getElementById("output-meta");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("preview-canvas");
const ctx = canvas.getContext("2d");

let originalImage = null;
let originalFileName = "converted-image";

qualitySlider.oninput = () => {
  qualityLabel.innerText = `Quality (${qualitySlider.value}%)`;
};

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  originalFileName = file.name.split(".")[0];
  fileInfo.innerText = `Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage = new Image();
    originalImage.onload = () => {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImage, 0, 0);
      statusText.innerText = "Ready for Conversion";
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

convertBtn.onclick = () => {
  if (!originalImage) return alert("Please select an image first.");

  const mimeType = targetFormat.value;
  const quality = qualitySlider.value / 100;

  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);
  }

  const newDataUrl = canvas.toDataURL(mimeType, quality);

  const extension = mimeType.split("/")[1];
  const cleanExt = extension === "jpeg" ? "jpg" : extension;

  const link = document.createElement("a");
  link.href = newDataUrl;
  link.download = `${originalFileName}.${cleanExt}`;
  link.click();

  statusText.innerText = `Exported as ${cleanExt.toUpperCase()}`;
  outputMeta.innerText = `FILE SAVED: ${originalFileName}.${cleanExt}`;
};

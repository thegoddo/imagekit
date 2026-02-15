const fileInput = document.getElementById("file-input");
const compressBtn = document.getElementById("compress-btn");
const downloadBtn = document.getElementById("download-btn");
const originalInfo = document.getElementById("original-info");
const outputInfo = document.getElementById("output-info");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("preview-canvas");
const ctx = canvas.getContext("2d");

let selectedFile = null;
let compressedBlob = null;

fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (!selectedFile) return;

  // Display original stats
  const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
  originalInfo.innerText = `Original: ${sizeMB} MB`;
  statusText.innerText = "Image Loaded";

  // Draw original to canvas for preview
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);
});

compressBtn.onclick = async () => {
  if (!selectedFile) return alert("Please load an image first.");

  statusText.innerText = "Compressing...";

  const options = {
    maxSizeMB: parseFloat(document.getElementById("max-size").value), // 1. Compress by size
    maxWidthOrHeight: parseInt(document.getElementById("max-width").value), // 2. Compress by resolution
    useWebWorker: true, // Performance optimization
    onProgress: (p) => {
      statusText.innerText = `Processing: ${p}%`;
    },
  };

  try {
    compressedBlob = await imageCompression(selectedFile, options); // Perform compression

    const outputSize = (compressedBlob.size / 1024 / 1024).toFixed(2);
    outputInfo.innerText = `COMPRESSION COMPLETE: ${outputSize} MB`;
    statusText.innerText = "Optimization Finished";

    // Update preview with compressed version
    const url = URL.createObjectURL(compressedBlob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      downloadBtn.style.display = "block";
    };
    img.src = url;
  } catch (error) {
    console.error(error);
    statusText.innerText = "Error during compression.";
  }
};

downloadBtn.onclick = () => {
  if (!compressedBlob) return;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(compressedBlob);
  link.download = `optimized_${selectedFile.name}`;
  link.click();
};

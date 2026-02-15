const fileInput = document.getElementById("file-input");
const extractBtn = document.getElementById("extract-btn");
const outputText = document.getElementById("output-text");
const statusText = document.getElementById("status-text");
const canvas = document.getElementById("ocr-canvas");
const overlay = document.getElementById("ocr-overlay");
const ctx = canvas.getContext("2d");

let selectedImage = null;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    selectedImage = new Image();
    selectedImage.onload = () => {
      canvas.width = selectedImage.width;
      canvas.height = selectedImage.height;
      overlay.style.width = canvas.clientWidth + "px";
      overlay.style.height = canvas.clientHeight + "px";
      ctx.drawImage(selectedImage, 0, 0);
      statusText.innerText = "Ready for Scan";
    };
    selectedImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

extractBtn.onclick = async () => {
  if (!selectedImage) return alert("Load image first.");

  statusText.innerText = "Extracting... Please wait";
  overlay.innerHTML = ""; 

  const worker = await Tesseract.createWorker(
    document.getElementById("lang-select").value,
  );

  try {
    const { data } = await worker.recognize(selectedImage);

    outputText.value = data.text;

    const scaleX = canvas.clientWidth / selectedImage.width;
    const scaleY = canvas.clientHeight / selectedImage.height;

    data.words.forEach((word) => {
      const box = document.createElement("div");
      box.className = "word-box";
      box.style.left = word.bbox.x0 * scaleX + "px";
      box.style.top = word.bbox.y0 * scaleY + "px";
      box.style.width = (word.bbox.x1 - word.bbox.x0) * scaleX + "px";
      box.style.height = (word.bbox.y1 - word.bbox.y0) * scaleY + "px";

      box.title = "Click to Copy: " + word.text;
      box.onclick = () => {
        navigator.clipboard.writeText(word.text);
        statusText.innerText = `Copied: "${word.text}"`;
        setTimeout(() => (statusText.innerText = "Scan Complete"), 2000);
      };

      overlay.appendChild(box);
    });

    statusText.innerText = "Scan Complete";
    await worker.terminate();
  } catch (err) {
    console.error(err);
    statusText.innerText = "OCR Failed";
  }
};

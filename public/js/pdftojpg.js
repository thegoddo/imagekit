pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfInput = document.getElementById("pdf-input");
const pageContainer = document.getElementById("page-container");
const statusText = document.getElementById("status-text");
const rangeInput = document.getElementById("page-range");
const applyBtn = document.getElementById("apply-range-btn");
const convertBtn = document.getElementById("convert-btn");

let pdfDoc = null;
let pageData = []; // Stores { canvas, num, checkbox }

pdfInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  pageContainer.innerHTML = "";
  pageData = [];
  const typedarray = new Uint8Array(await file.arrayBuffer());

  pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
  statusText.innerText = `Index: ${pdfDoc.numPages} Pages Detected`;
  convertBtn.style.display = "block";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    await renderThumbnail(i);
  }
};

async function renderThumbnail(num) {
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: 0.5 }); // Lower res for preview

  const wrapper = document.createElement("div");
  wrapper.className = "pdf-page-preview";
  wrapper.id = `page-wrapper-${num}`;

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = "page-checkbox";
  cb.onchange = () => wrapper.classList.toggle("selected", cb.checked);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport }).promise;

  wrapper.innerHTML += `<span>Page ${num}</span>`;
  wrapper.prepend(cb);
  wrapper.prepend(canvas);
  pageContainer.appendChild(wrapper);
  pageData.push({ canvas, num, cb, wrapper });
}

// Logic to parse Print-style range
applyBtn.onclick = () => {
  const rangeStr = rangeInput.value.trim();
  if (!rangeStr) return;

  const selectedPages = new Set();
  const parts = rangeStr.split(",");

  parts.forEach((part) => {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) selectedPages.add(i);
    } else {
      selectedPages.add(Number(part));
    }
  });

  pageData.forEach((item) => {
    const isSelected = selectedPages.has(item.num);
    item.cb.checked = isSelected;
    item.wrapper.classList.toggle("selected", isSelected);
  });
};

convertBtn.onclick = async () => {
  statusText.innerText = "Processing Selection...";

  for (const item of pageData) {
    if (item.cb.checked) {
      // Re-render at higher resolution for actual download
      const page = await pdfDoc.getPage(item.num);
      const viewport = page.getViewport({ scale: 2.0 });
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = viewport.width;
      offscreenCanvas.height = viewport.height;

      await page.render({
        canvasContext: offscreenCanvas.getContext("2d"),
        viewport,
      }).promise;

      const link = document.createElement("a");
      link.download = `document-p${item.num}.jpg`;
      link.href = offscreenCanvas.toDataURL("image/jpeg", 0.9);
      link.click();
    }
  }
  statusText.innerText = "Download Sequence Finished";
};

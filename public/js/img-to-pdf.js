const { jsPDF } = window.jspdf;
const fileInput = document.getElementById("file-input");
const queueContainer = document.getElementById("pdf-queue");
const convertBtn = document.getElementById("convert-btn");
const emptyMsg = document.getElementById("empty-msg");

let imageFiles = [];

fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    imageFiles.push(file);
    renderQueue();
  });
});

function renderQueue() {
  queueContainer.innerHTML = "";
  emptyMsg.style.display = imageFiles.length ? "none" : "block";

  imageFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "queue-item";
      div.style.backgroundImage = `url(${e.target.result})`;

      const btn = document.createElement("button");
      btn.className = "remove-img";
      btn.innerText = "X";
      btn.onclick = () => {
        imageFiles.splice(index, 1);
        renderQueue();
      };

      div.appendChild(btn);
      queueContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

convertBtn.onclick = async () => {
  if (imageFiles.length === 0) return alert("Add images first!");

  const orientation = document.getElementById("pdf-orient").value;
  const doc = new jsPDF({
    orientation: orientation,
    unit: "px",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < imageFiles.length; i++) {
    const imgData = await readFileAsDataURL(imageFiles[i]);

    // Add new page for subsequent images
    if (i > 0) doc.addPage();

    // Fit image to page while maintaining aspect ratio
    doc.addImage(
      imgData,
      "JPEG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST",
    );
  }

  doc.save(`archive_${Date.now()}.pdf`);
};

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

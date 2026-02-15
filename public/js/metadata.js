let currentBase64 = null;
let exifObj = null;

const fileInput = document.getElementById("file-input");
const metaList = document.getElementById("metadata-list");
const placeholder = document.getElementById("status-placeholder");

// Essential tags to keep for WhatsApp/Google Photos timeline
const APP_FRIENDLY_TAGS = {
  "0th": [
    piexif.ImageIFD.DateTime,
    piexif.ImageIFD.Orientation,
    piexif.ImageIFD.Software,
  ],
  Exif: [piexif.ExifIFD.DateTimeOriginal, piexif.ExifIFD.DateTimeDigitized],
  GPS: [], // Strip GPS for privacy
};

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentBase64 = event.target.result;
    exifObj = piexif.load(currentBase64); // Load headers into object
    renderUI();
  };
  reader.readAsDataURL(file);
});

function renderUI() {
  metaList.innerHTML = "";
  placeholder.style.display = "none";

  // Loop categories: 0th (Main), Exif (Sub), GPS
  ["0th", "Exif", "GPS"].forEach((cat) => {
    for (const tagId in exifObj[cat]) {
      const tagName = piexif.TAGS[cat][tagId]?.name || `Tag ${tagId}`;
      const value = exifObj[cat][tagId];

      const row = document.createElement("div");
      row.className = "meta-row";
      row.innerHTML = `
                <div class="meta-info">
                    <span class="meta-key">${cat}: ${tagName}</span>
                    <span class="meta-val">${value}</span>
                </div>
                <div class="meta-actions">
                    <button class="btn-action" onclick="window.editMeta('${cat}', ${tagId})">EDIT</button>
                    <button class="btn-action" style="color:red;" onclick="window.deleteMeta('${cat}', ${tagId})">DEL</button>
                </div>
            `;
      metaList.appendChild(row);
    }
  });
}

// 1. Individual Tag Actions
window.editMeta = (cat, tagId) => {
  const newVal = prompt(
    `Update ${piexif.TAGS[cat][tagId].name}:`,
    exifObj[cat][tagId],
  );
  if (newVal !== null) {
    exifObj[cat][tagId] = newVal;
    syncAndRender();
  }
};

window.deleteMeta = (cat, tagId) => {
  if (confirm(`Delete ${piexif.TAGS[cat][tagId].name}?`)) {
    delete exifObj[cat][tagId];
    syncAndRender();
  }
};

// 2. Global Actions
document.getElementById("strip-all-btn").onclick = () => {
  currentBase64 = piexif.remove(currentBase64); // Strip entire binary segment
  exifObj = piexif.load(currentBase64);
  renderUI();
};

document.getElementById("smart-clean-btn").onclick = () => {
  for (const cat in exifObj) {
    if (cat === "thumbnail" || cat === "1st") continue;
    const whitelist = APP_FRIENDLY_TAGS[cat] || [];

    Object.keys(exifObj[cat]).forEach((id) => {
      if (!whitelist.includes(Number(id))) {
        delete exifObj[cat][id]; // Remove non-essential tags
      }
    });
  }
  syncAndRender();
};

// 3. Binary Sync (No download)
function syncAndRender() {
  try {
    const exifBytes = piexif.dump(exifObj); // Object -> Binary
    currentBase64 = piexif.insert(exifBytes, currentBase64); // Re-insert into image
    renderUI();
  } catch (e) {
    console.error("EXIF Sync Error:", e);
  }
}

// 4. Download Final Result
document.getElementById("download-final").onclick = () => {
  if (!currentBase64) return;
  const link = document.createElement("a");
  link.href = currentBase64;
  link.download = `meta_fixed_${Date.now()}.jpg`;
  link.click();
};

const fileInput = document.getElementById("file-input");
const upscaleBtn = document.getElementById("upscale-btn");
const abortBtn = document.getElementById("abort-btn");
const statusText = document.getElementById("status-text");
const progress = document.getElementById("upscale-progress");
const gpuStatus = document.getElementById("gpu-status");
const canvas = document.getElementById("upscale-canvas");
const ctx = canvas.getContext("2d");

let originalImage = new Image();
let controller = new AbortController();

// 1. Hardware Detection: GPU vs CPU
const hasWebGL = () => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  return !!(gl && gl instanceof WebGLRenderingContext);
};

if (!hasWebGL()) {
  gpuStatus.innerText = "GPU Unavailable: Using CPU (Slower)";
  gpuStatus.style.color = "orange";
  tf.setBackend("cpu"); // Fallback to CPU
} else {
  gpuStatus.innerText = "GPU Hardware Accelerated";
}

fileInput.onchange = (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage.onload = () => {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      statusText.innerText = "Ready for Neural Upscale";
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

upscaleBtn.onclick = async () => {
  if (!originalImage.src) return alert("Load image first.");

  // Safeguard: Limit input size to prevent instant crash
  if (originalImage.width > 1200 || originalImage.height > 1200) {
    if (
      !confirm(
        "Large image detected. This may still lag your system. Continue?",
      )
    )
      return;
  }

  statusText.innerText = "Initializing AI...";
  progress.style.display = "block";
  abortBtn.style.display = "block";
  upscaleBtn.disabled = true;

  try {
    const upscaler = new Upscaler({
      model: window.DefaultUpscalerJSModel, // 2x AI Model
    });

    // 2. Safeguard: High Granularity Processing
    // Small patchSize (32) makes the UI more responsive during AI work
    const upscaledDataUrl = await upscaler.upscale(originalImage, {
      patchSize: 32,
      padding: 2,
      signal: controller.signal, // Allows emergency stop
      progress: (amount) => {
        const percent = Math.round(amount * 100);
        progress.value = percent;
        statusText.innerText = `Neural Mapping: ${percent}%`;
      },
    });

    const resultImg = new Image();
    resultImg.onload = () => {
      canvas.width = resultImg.width;
      canvas.height = resultImg.height;
      ctx.drawImage(resultImg, 0, 0);
      statusText.innerText = "Upscale Complete";
      document.getElementById("download-btn").style.display = "block";
      document.getElementById("download-btn").onclick = () => {
        const link = document.createElement("a");
        link.download = "neural_upscale.png";
        link.href = upscaledDataUrl;
        link.click();
      };
    };
    resultImg.src = upscaledDataUrl;
  } catch (err) {
    if (err.name === "AbortError") {
      statusText.innerText = "Task Aborted by Safeguard";
    } else {
      statusText.innerText = "Resource Error: Task Failed";
      console.error(err);
    }
  } finally {
    progress.style.display = "none";
    abortBtn.style.display = "none";
    upscaleBtn.disabled = false;
  }
};

abortBtn.onclick = () => {
  controller.abort();
  controller = new AbortController(); // Reset for next time
};

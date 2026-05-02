// Force scroll to top on reload
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

function drawPixelNoise(id, accentColor) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const palette = [
    "#111",
    "#181818",
    "#1e1e1e",
    "#222",
    accentColor || "#4a90d9",
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = Math.random();
      let color;
      if (r < 0.55) color = palette[0];
      else if (r < 0.75) color = palette[1];
      else if (r < 0.88) color = palette[2];
      else if (r < 0.96) color = palette[3];
      else color = palette[4];
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
drawPixelNoise("c1", "#4a90d9");
drawPixelNoise("c2", "#4a90d9");
drawPixelNoise("c3", "#4a90d9");

// ─── ENTRY ANIMATION ─────────────
document.fonts.ready.then(() => {
  const text = "SPEAKING WITH CODE";
  const overlay = document.getElementById("entry-overlay");
  if (!overlay) return;
  const gridContainer = document.getElementById("pixel-grid");
  const hint = document.getElementById("entry-hint");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const fontSize = 12;
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;

  const textMetrics = ctx.measureText(text);
  const width = Math.ceil(textMetrics.width);
  const height = fontSize * 2;

  canvas.width = width;
  canvas.height = height;

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";
  ctx.fillText(text, 0, fontSize * 0.2);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;
  const pixels = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 128) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        pixels.push({ x, y });
      }
    }
  }

  const gridCols = maxX - minX + 1;
  const gridRows = maxY - minY + 1;

  gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;

  const gridWidth = gridCols * 6; // 5px cell + 1px gap
  if (gridWidth > window.innerWidth * 0.9) {
    gridContainer.style.transform = `scale(${(window.innerWidth * 0.9) / gridWidth})`;
  }

  const cellMap = new Map();
  for (let p of pixels) {
    cellMap.set(`${p.x - minX},${p.y - minY}`, true);
  }

  const pixelElements = [];

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const cell = document.createElement("div");
      cell.className = "pixel-cell";
      if (cellMap.has(`${c},${r}`)) {
        cell.classList.add("active");
        const rx = (Math.random() - 0.5) * window.innerWidth * 2;
        const ry = (Math.random() - 0.5) * window.innerHeight * 2;
        const rz = (Math.random() - 0.5) * 720;

        cell.style.transform = `translate(${rx}px, ${ry}px) rotate(${rz}deg)`;
        cell.style.opacity = "0";
        cell.style.transitionDelay = `${Math.random() * 0.3}s`;

        pixelElements.push({ el: cell });
      }
      gridContainer.appendChild(cell);
    }
  }

  // Fade in scattered pixels
  setTimeout(() => {
    pixelElements.forEach((p) => {
      p.el.style.opacity = "1";
    });
  }, 100);

  let interacted = false;
  const hintTimeout = setTimeout(() => {
    if (!interacted) {
      hint.classList.add("visible");
    }
  }, 3000);

  const onInteract = () => {
    if (interacted) return;
    interacted = true;
    clearTimeout(hintTimeout);
    hint.classList.remove("visible");

    // Animate pixels to original positions
    pixelElements.forEach((p) => {
      p.el.style.transform = "translate(0, 0) rotate(0deg)";
    });

    // Reveal name, nav, and dot background after animation completes
    setTimeout(() => {
      const nameReveal = document.getElementById("name-reveal");
      if (nameReveal) nameReveal.classList.add("visible");

      const nav = document.querySelector("nav");
      if (nav) nav.classList.add("visible");

      const overlay = document.getElementById("entry-overlay");
      if (overlay) overlay.classList.add("transparent-bg");

      const btns = document.getElementById("overlay-btns");
      if (btns) btns.classList.add("visible");

      document.body.classList.remove("no-scroll");
    }, 1500);

    window.removeEventListener("mousemove", onInteract);
    window.removeEventListener("touchstart", onInteract);
  };

  window.addEventListener("mousemove", onInteract);
  window.addEventListener("touchstart", onInteract);

  // Skip logic
  const skipCheck = document.getElementById("skip-animation-check");
  const isSkipped = localStorage.getItem("skipAnimation") === "true";

  if (skipCheck) {
    skipCheck.checked = isSkipped;
    skipCheck.addEventListener("change", (e) => {
      localStorage.setItem("skipAnimation", e.target.checked);
    });
  }

  if (isSkipped) {
    // Jump to final state immediately
    interacted = true;
    clearTimeout(hintTimeout);
    if (hint) hint.classList.remove("visible");

    // Assemble pixels without delay
    pixelElements.forEach((p) => {
      p.el.style.transition = "none";
      p.el.style.transform = "translate(0, 0) rotate(0deg)";
      p.el.style.opacity = "1";
    });

    // Reveal name, nav, etc immediately
    const nameReveal = document.getElementById("name-reveal");
    if (nameReveal) {
      nameReveal.style.transition = "none";
      nameReveal.classList.add("visible");
    }

    const nav = document.querySelector("nav");
    if (nav) {
      nav.style.transition = "none";
      nav.classList.add("visible");
    }

    const overlay = document.getElementById("entry-overlay");
    if (overlay) {
      overlay.style.transition = "none";
      overlay.classList.add("transparent-bg");
    }

    const btns = document.getElementById("overlay-btns");
    if (btns) {
      btns.style.transition = "none";
      btns.classList.add("visible");
    }

    document.body.classList.remove("no-scroll");
  }
});

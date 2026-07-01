document.addEventListener("DOMContentLoaded", () => {
  const revealBoxButton = document.getElementById("revealBoxButton");
  const floatingMemories = document.getElementById("floatingMemories");
  const voiceNotePlayer = document.getElementById("voiceNotePlayer");
  const playBtn = document.getElementById("playBtn");
  const waveform = document.getElementById("waveform");
  const nextPageButton = document.getElementById("nextPageButton");
  const confettiCanvas = document.getElementById("confettiCanvas");

  if (!revealBoxButton) return;

  const memoriesData = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.floatingMemories)
    ? BirthdayConfig.floatingMemories
    : [];

  const voiceNoteUrl = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.voiceNoteUrl)
    ? BirthdayConfig.voiceNoteUrl
    : "";

  let confettiStarted = false;
  let confettiPieces = [];
  let confettiFrame = null;
  let voiceNoteAudio = null;
  let voiceNotePlaying = false;

  // Initialize Voice Note Audio if provided
  if (voiceNoteUrl) {
    voiceNoteAudio = new Audio(voiceNoteUrl);
    voiceNoteAudio.addEventListener("ended", () => {
      stopVoiceNote();
    });
  }

  // 1. Box Reveal handler
  revealBoxButton.addEventListener("click", () => {
    // Prevent double clicking
    if (revealBoxButton.classList.contains("is-open")) return;
    
    revealBoxButton.classList.add("is-open");

    // Spawn golden sparkles rising from box center
    const boxContainer = revealBoxButton.querySelector(".luxury-gift");
    if (boxContainer) {
      spawnGoldSparkles(boxContainer);
    }

    // Start sparkles and confetti
    startConfetti();

    // Create and animate floating polaroids
    createFloatingMemories();

    // Show Voice Note Player if URL exists
    if (voiceNoteUrl && voiceNotePlayer) {
      setTimeout(() => {
        voiceNotePlayer.classList.add("is-visible");
      }, 1500);
    }

    // Show step navigation button after a delay
    setTimeout(() => {
      if (nextPageButton) {
        nextPageButton.classList.add("is-visible");
      }
    }, 4500);
  });

  // 2. Polaroid generator
  function photoBackground(photo, fallbackIndex) {
    if (photo) {
      return `url('${photo}')`;
    }
    const gradients = [
      "radial-gradient(circle at 30% 25%, rgba(255,255,255,.9) 0 .9rem, transparent 1rem), linear-gradient(145deg, #ffd6ea, #d9b8ff)",
      "radial-gradient(circle at 70% 30%, rgba(255,255,255,.85) 0 1rem, transparent 1.1rem), linear-gradient(145deg, #ffc4df, #b98cff)",
      "radial-gradient(circle at 40% 72%, rgba(255,255,255,.88) 0 .9rem, transparent 1rem), linear-gradient(145deg, #fff1f8, #ff8fbd 52%, #a66cff)",
      "radial-gradient(circle at 64% 38%, rgba(255,255,255,.82) 0 .85rem, transparent .95rem), linear-gradient(145deg, #ffe3f0, #d5b2ff)",
    ];
    return gradients[fallbackIndex % gradients.length];
  }

  function getCaptionWithIcon(caption) {
    if (!caption) return "";
    if (caption.includes("✨")) {
      return `${caption.replace("✨", "")} <svg class="caption-icon inline-sparkle-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 1.15rem; height: 1.15rem; vertical-align: middle; margin-left: 0.2rem; color: #ffb347; display: inline-block; margin-top: -0.15rem;"><path d="M12 2l2.4 5.2 5.6 2.4-5.6 2.4-2.4 5.2-2.4-5.2-5.6-2.4 5.6-2.4zM20 16l1.2 2.6 2.8 1.2-2.8 1.2-1.2 2.6-1.2-2.6-2.8-1.2 2.8-1.2zM6 15l1.2 2.6 2.8 1.2-2.8 1.2-1.2 2.6-1.2-2.6-2.8-1.2 2.8-1.2z"/></svg>`;
    }
    if (caption.includes("📸")) {
      return `${caption.replace("📸", "")} <svg class="caption-icon inline-camera-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 1.15rem; height: 1.15rem; vertical-align: middle; margin-left: 0.2rem; color: #a3b8cc; display: inline-block; margin-top: -0.15rem;"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    }
    if (caption.includes("❤️")) {
      return `${caption.replace("❤️", "")} <svg class="caption-icon inline-heart-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 1.15rem; height: 1.15rem; vertical-align: middle; margin-left: 0.2rem; color: #ff527c; display: inline-block; margin-top: -0.15rem;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
    if (caption.includes("🌙")) {
      return `${caption.replace("🌙", "")} <svg class="caption-icon inline-moon-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 1.15rem; height: 1.15rem; vertical-align: middle; margin-left: 0.2rem; color: #d0c4de; display: inline-block; margin-top: -0.15rem;"><path d="M12.1 22C6.52 22 2 17.48 2 11.9c0-4.75 3.27-8.73 7.82-9.72.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2-4.4 5.2-4.4 8.7 0 5 4 9 9 9 2.5 0 4.8-1 6.5-2.8.4-.4.9-.5 1.4-.3.5.2.8.7.7 1.2-.9 4.6-4.9 7.9-9.8 7.9z"/></svg>`;
    }
    return caption;
  }

  function createFloatingMemories() {
    if (!floatingMemories) return;
    floatingMemories.innerHTML = "";

    // Responsive positions using viewport relative units to avoid screen overflow
    const positions = [
      { left: "50%", top: "50%", x: "-27vw", y: "-22vh", rotate: "-9deg" },
      { left: "50%", top: "50%", x: "27vw", y: "-22vh", rotate: "8deg" },
      { left: "50%", top: "50%", x: "-25vw", y: "14vh", rotate: "6deg" },
      { left: "50%", top: "50%", x: "25vw", y: "14vh", rotate: "-7deg" },
    ];

    memoriesData.forEach((memory, index) => {
      const pos = positions[index % positions.length];
      const card = document.createElement("div");
      card.className = "float-photo";
      card.style.left = pos.left;
      card.style.top = pos.top;
      card.style.setProperty("--x", pos.x);
      card.style.setProperty("--y", pos.y);
      card.style.setProperty("--rotate", pos.rotate);
      card.innerHTML = `
        <div class="photo-img" style="background-image: ${photoBackground(memory.photo, index)};"></div>
        <span>${getCaptionWithIcon(memory.caption)}</span>
      `;
      
      // Polaroid tap-to-zoom logic
      card.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering body backdrop dismiss
        const wasZoomed = card.classList.contains("is-zoomed");
        
        // Remove zoom from all cards
        document.querySelectorAll(".float-photo").forEach(c => c.classList.remove("is-zoomed"));
        
        if (!wasZoomed) {
          card.classList.add("is-zoomed");
        }
      });

      floatingMemories.appendChild(card);

      // Stagger activation
      setTimeout(() => {
        card.classList.add("is-visible");
      }, 300 + index * 350);
    });

    // Dismiss zoom when tapping outside
    document.addEventListener("click", () => {
      document.querySelectorAll(".float-photo").forEach(c => c.classList.remove("is-zoomed"));
    });
  }

  // 3. Confetti logic
  const ctx = confettiCanvas.getContext("2d");

  function resizeConfetti() {
    const ratio = window.devicePixelRatio || 1;
    confettiCanvas.width = Math.floor(window.innerWidth * ratio);
    confettiCanvas.height = Math.floor(window.innerHeight * ratio);
    confettiCanvas.style.width = `${window.innerWidth}px`;
    confettiCanvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function initConfettiPieces() {
    const colors = ["#ff70ad", "#d9b8ff", "#ffd8ea", "#9b5de5", "#fff6fa", "#ffd633"];
    const count = window.innerWidth < 600 ? 55 : 110;
    confettiPieces = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: 4 + Math.random() * 8,
      speed: 1.0 + Math.random() * 2.5,
      drift: -0.8 + Math.random() * 1.6,
      rotation: Math.random() * 360,
      spin: -4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += piece.spin;

      // Wrap around bottom
      if (piece.y > window.innerHeight + 20) {
        piece.y = -20;
        piece.x = Math.random() * window.innerWidth;
      }

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      ctx.restore();
    });

    confettiFrame = window.requestAnimationFrame(drawConfetti);
  }

  function startConfetti() {
    if (confettiStarted) return;
    confettiStarted = true;
    resizeConfetti();
    initConfettiPieces();
    drawConfetti();
  }

  window.addEventListener("resize", () => {
    if (!confettiStarted) return;
    window.cancelAnimationFrame(confettiFrame);
    resizeConfetti();
    drawConfetti();
  });

  // 4. Voice Note Audio Controls
  if (playBtn && voiceNoteAudio) {
    playBtn.addEventListener("click", () => {
      if (voiceNotePlaying) {
        pauseVoiceNote();
      } else {
        playVoiceNote();
      }
    });
  }

  function playVoiceNote() {
    if (!voiceNoteAudio) return;
    voiceNotePlaying = true;
    playBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    `;
    waveform.classList.add("is-playing");
    
    // Fade out global background music
    if (typeof fadeOutMusic === "function") {
      fadeOutMusic(800);
    }

    // Play voice note after a tiny gap to let music fade
    setTimeout(() => {
      if (voiceNotePlaying && voiceNoteAudio) {
        voiceNoteAudio.play().catch(e => console.log(e));
      }
    }, 200);
  }

  function pauseVoiceNote() {
    if (!voiceNoteAudio) return;
    voiceNotePlaying = false;
    playBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 2px;">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    waveform.classList.remove("is-playing");
    voiceNoteAudio.pause();

    // Fade background music back in
    if (typeof fadeInMusic === "function") {
      fadeInMusic(0.28, 800);
    }
  }

  function stopVoiceNote() {
    if (!voiceNoteAudio) return;
    voiceNotePlaying = false;
    playBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 2px;">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    waveform.classList.remove("is-playing");
    voiceNoteAudio.currentTime = 0;

    // Fade background music back in
    if (typeof fadeInMusic === "function") {
      fadeInMusic(0.28, 800);
    }
  }

  // 5. Navigate to ending page
  if (nextPageButton) {
    nextPageButton.addEventListener("click", () => {
      // Stop voice note if playing before transition
      if (voiceNotePlaying) {
        stopVoiceNote();
      }

      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("wish.html");
      } else {
        window.location.href = "wish.html";
      }
    });
  }

  function spawnGoldSparkles(container) {
    const sparklesCount = 24;
    const colors = ["#ffc837", "#ff9f43", "#fff3cc", "#ffd700", "#ffb347"];
    const symbols = ["✦", "✧", "•", "✨"];
    
    for (let i = 0; i < sparklesCount; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "gold-sparkle";
      sparkle.textContent = symbols[i % symbols.length];
      
      const startX = (Math.random() - 0.5) * 60;
      const startY = -10 + (Math.random() - 0.5) * 15;
      
      sparkle.style.setProperty("--startX", `${startX}px`);
      sparkle.style.setProperty("--startY", `${startY}px`);
      
      const moveX = (Math.random() - 0.5) * 120;
      const moveY = -130 - Math.random() * 110;
      
      sparkle.style.setProperty("--moveX", `${moveX}px`);
      sparkle.style.setProperty("--moveY", `${moveY}px`);
      
      sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.fontSize = `${0.65 + Math.random() * 0.75}rem`;
      sparkle.style.animationDuration = `${1.3 + Math.random() * 1.1}s`;
      sparkle.style.animationDelay = `${Math.random() * 0.4}s`;
      
      container.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 2500);
    }
  }
});

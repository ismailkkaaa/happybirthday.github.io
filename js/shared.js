let audioInstance = null;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Page Transition Overlay
  const overlay = document.createElement("div");
  overlay.className = "page-transition-overlay";
  document.body.prepend(overlay);

  // 2. Inject Ambient Particle Layer if not present
  let ambientLayer = document.querySelector(".ambient");
  if (!ambientLayer) {
    ambientLayer = document.createElement("div");
    ambientLayer.className = "ambient";
    ambientLayer.setAttribute("aria-hidden", "true");
    ambientLayer.innerHTML = `
      <span class="aura aura-one"></span>
      <span class="aura aura-two"></span>
      <span class="aura aura-three"></span>
      <div id="particleLayer" class="particle-layer"></div>
    `;
    document.body.appendChild(ambientLayer);
  }

  // 3. Inject Progress Indicator (for chapters 1 to 5)
  const mainJourney = document.querySelector("main.journey");
  if (mainJourney) {
    const chapter = mainJourney.getAttribute("data-chapter");
    if (chapter && parseInt(chapter) >= 1 && parseInt(chapter) <= 5) {
      const progressPill = document.createElement("div");
      progressPill.className = "progress-indicator";
      progressPill.innerHTML = `Chapter ${chapter} of 6 <span aria-hidden="true" class="progress-heart-container" style="color: var(--pink); display: inline-flex; align-items: center; margin-left: 0.3rem; vertical-align: middle; width: 0.95rem; height: 0.95rem;"><svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
      document.body.appendChild(progressPill);
    }
  }

  // 4. Initialize Background Music
  initBackgroundMusic();

  // 5. Spawn Ambient Particles
  createAmbientParticles();

  // 6. Trigger Page Load Animations
  setTimeout(() => {
    overlay.classList.add("is-loaded");
    if (mainJourney) {
      mainJourney.classList.add("is-active");
    }
  }, 100);
});

// Particle Spawning Logic
function createAmbientParticles() {
  const particleLayer = document.getElementById("particleLayer");
  if (!particleLayer) return;

  const symbols = ["✦", "♡", "·", "✧"]; // Removed standard colorful emoji ❤️, replaced with outlines/sparkles!
  const fragment = document.createDocumentFragment();
  const count = window.innerWidth < 600 ? 18 : 35; // Optimize particle count for mobile performance

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = symbols[index % symbols.length];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${12 + Math.random() * 15}s`;
    particle.style.animationDelay = `${Math.random() * -20}s`;
    particle.style.opacity = `${0.2 + Math.random() * 0.5}`;
    particle.style.fontSize = `${0.6 + Math.random() * 0.9}rem`;
    fragment.appendChild(particle);
  }

  particleLayer.appendChild(fragment);
}

// Background Music Persistence Logic
function initBackgroundMusic() {
  if (typeof BirthdayConfig === "undefined" || !BirthdayConfig.musicUrl) return;

  // Restrict background music loading to surprise.html (the climax) and ending.html
  const path = window.location.pathname;
  const isSurpriseOrEnding = path.includes("surprise.html") || path.includes("ending.html");
  if (!isSurpriseOrEnding) return;

  let audio = document.getElementById("global-background-music");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "global-background-music";
    audio.loop = true;
    audio.preload = "auto";
    audio.src = BirthdayConfig.musicUrl;
    document.body.appendChild(audio);
  }
  audioInstance = audio;

  const savedTime = sessionStorage.getItem("musicTime");
  const isPlaying = sessionStorage.getItem("musicPlaying");

  if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
  }

  // Set default gentle volume
  audio.volume = 0.28;

  // Autoplay only on ending.html or if already explicitly triggered on surprise.html (upon opening the box)
  if (isPlaying === "true" || path.includes("ending.html")) {
    attemptPlayMusic();
  }

  // Continually update sessionStorage to prevent sync loss on unexpected exit
  audio.addEventListener("timeupdate", () => {
    sessionStorage.setItem("musicTime", audio.currentTime);
  });
}

function startGlobalMusic() {
  sessionStorage.setItem("musicPlaying", "true");
  if (audioInstance) {
    attemptPlayMusic();
  }
}

function attemptPlayMusic() {
  if (!audioInstance) return;
  audioInstance.play().then(() => {
    // Audio started successfully
  }).catch(() => {
    console.log("Autoplay blocked. Waiting for first click/tap to resume music.");
    const resumeOnInteraction = () => {
      if (audioInstance) {
        audioInstance.play().catch(e => console.log("Play failed: ", e));
      }
      document.removeEventListener("click", resumeOnInteraction);
      document.removeEventListener("touchstart", resumeOnInteraction);
    };
    document.addEventListener("click", resumeOnInteraction);
    document.addEventListener("touchstart", resumeOnInteraction);
  });
}

// Page Transition Helper
function navigateWithTransition(url) {
  const overlay = document.querySelector(".page-transition-overlay");
  if (overlay) {
    overlay.classList.remove("is-loaded");
    overlay.classList.add("is-exiting");
  }

  if (audioInstance) {
    sessionStorage.setItem("musicTime", audioInstance.currentTime);
  }

  setTimeout(() => {
    window.location.href = url;
  }, 780);
}

// Volume fade transitions (for playing voice notes cleanly)
function fadeOutMusic(duration = 1000) {
  if (!audioInstance) return;
  const startVolume = audioInstance.volume;
  const interval = 50;
  const steps = duration / interval;
  const delta = startVolume / steps;

  const timer = setInterval(() => {
    if (audioInstance.volume > delta) {
      audioInstance.volume -= delta;
    } else {
      audioInstance.volume = 0;
      audioInstance.pause();
      clearInterval(timer);
    }
  }, interval);
}

function fadeInMusic(targetVolume = 0.28, duration = 1000) {
  if (!audioInstance) return;
  audioInstance.volume = 0;
  audioInstance.play().then(() => {
    const interval = 50;
    const steps = duration / interval;
    const delta = targetVolume / steps;

    const timer = setInterval(() => {
      if (audioInstance.volume < targetVolume - delta) {
        audioInstance.volume += delta;
      } else {
        audioInstance.volume = targetVolume;
        clearInterval(timer);
      }
    }, interval);
  }).catch(e => console.log(e));
}

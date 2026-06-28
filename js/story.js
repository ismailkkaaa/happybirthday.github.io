document.addEventListener("DOMContentLoaded", () => {
  const storiesViewer = document.getElementById("storiesViewer");
  const slidesWrapper = document.getElementById("slidesWrapper");
  const progressBarContainer = document.getElementById("progressBarContainer");
  const tapLeft = document.getElementById("tapLeft");
  const tapRight = document.getElementById("tapRight");
  const storiesTutorial = document.getElementById("storiesTutorial");
  const musicToggleBtn = document.getElementById("musicToggleBtn");

  if (!storiesViewer || !slidesWrapper || !progressBarContainer) return;

  const timelineData = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.storyTimeline)
    ? BirthdayConfig.storyTimeline
    : [];

  let currentIndex = 0;
  const slideDuration = 6000; // 6 seconds per slide
  let elapsedTime = 0;
  let isPaused = false;
  let lastFrameTime = 0;
  let animationId = null;

  function photoBackground(photo, fallbackIndex) {
    if (photo) {
      return `url("${photo}")`;
    }

    const gradients = [
      "radial-gradient(circle at 30% 25%, rgba(255,255,255,.9) 0 .9rem, transparent 1rem), linear-gradient(145deg, #ffd6ea, #d9b8ff)",
      "radial-gradient(circle at 70% 30%, rgba(255,255,255,.85) 0 1rem, transparent 1.1rem), linear-gradient(145deg, #ffc4df, #b98cff)",
      "radial-gradient(circle at 40% 72%, rgba(255,255,255,.88) 0 .9rem, transparent 1rem), linear-gradient(145deg, #fff1f8, #ff8fbd 52%, #a66cff)",
      "radial-gradient(circle at 64% 38%, rgba(255,255,255,.82) 0 .85rem, transparent .95rem), linear-gradient(145deg, #ffe3f0, #d5b2ff)",
    ];

    return gradients[fallbackIndex % gradients.length];
  }

  function renderStories() {
    slidesWrapper.innerHTML = "";
    progressBarContainer.innerHTML = "";

    timelineData.forEach((item, index) => {
      // 1. Create progress segment
      const segment = document.createElement("div");
      segment.className = "progress-segment";
      segment.innerHTML = `<span class="progress-fill"></span>`;
      progressBarContainer.appendChild(segment);

      // 2. Create slide
      const slide = document.createElement("article");
      slide.className = "story-slide";
      if (index === 0) slide.classList.add("is-active");

      const hasPhoto = !!item.photo;
      const bgClass = hasPhoto ? "" : " no-photo";

      slide.innerHTML = `
        <div class="slide-bg${bgClass}" style="--photo-bg: ${photoBackground(item.photo, index)}"></div>
        ${hasPhoto ? `<img src="${item.photo}" alt="${item.title}" class="slide-photo" />` : ""}
        <div class="slide-overlay">
          <h3>${item.title}</h3>
          <p>${item.text}</p>
          ${index === timelineData.length - 1 ? `
            <div class="final-action-card">
              <button id="openLetterBtn" class="primary-button" type="button">Read the Letter 💌</button>
            </div>
          ` : ""}
        </div>
      `;

      slidesWrapper.appendChild(slide);
    });
  }

  // Initial render
  renderStories();

  function syncProgressBars() {
    const fills = document.querySelectorAll(".progress-fill");
    fills.forEach((fill, idx) => {
      if (idx < currentIndex) {
        fill.style.width = "100%";
      } else if (idx > currentIndex) {
        fill.style.width = "0%";
      }
    });
  }

  function showSlide(index) {
    const slides = document.querySelectorAll(".story-slide");
    if (index < 0 || index >= slides.length) return;

    slides[currentIndex].classList.remove("is-active");
    currentIndex = index;
    slides[currentIndex].classList.add("is-active");

    syncProgressBars();
    elapsedTime = 0;
  }

  function nextSlide() {
    const slides = document.querySelectorAll(".story-slide");
    if (currentIndex < slides.length - 1) {
      showSlide(currentIndex + 1);
    } else {
      goToLetter();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      showSlide(currentIndex - 1);
    } else {
      elapsedTime = 0;
      const fills = document.querySelectorAll(".progress-fill");
      if (fills[0]) fills[0].style.width = "0%";
    }
  }

  function goToLetter() {
    if (animationId) cancelAnimationFrame(animationId);
    if (typeof navigateWithTransition === "function") {
      navigateWithTransition("letter.html");
    } else {
      window.location.href = "letter.html";
    }
  }

  // Animation Loop for Progress Indicator
  function updateProgress(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (!isPaused) {
      elapsedTime += delta;
      const fills = document.querySelectorAll(".progress-fill");
      if (fills[currentIndex]) {
        fills[currentIndex].style.width = `${Math.min(100, (elapsedTime / slideDuration) * 100)}%`;
      }

      if (elapsedTime >= slideDuration) {
        nextSlide();
      }
    }

    animationId = requestAnimationFrame(updateProgress);
  }

  // Start story loop
  lastFrameTime = performance.now();
  animationId = requestAnimationFrame(updateProgress);

  // Tap-to-Navigate controls
  if (tapLeft && tapRight) {
    tapLeft.addEventListener("click", (e) => {
      e.stopPropagation();
      prevSlide();
    });

    tapRight.addEventListener("click", (e) => {
      e.stopPropagation();
      nextSlide();
    });
  }

  // Pause on Hold / Touch controls
  const pauseHandler = () => { isPaused = true; };
  const resumeHandler = () => { isPaused = false; };

  storiesViewer.addEventListener("mousedown", pauseHandler);
  storiesViewer.addEventListener("mouseup", resumeHandler);
  storiesViewer.addEventListener("mouseleave", resumeHandler);

  storiesViewer.addEventListener("touchstart", pauseHandler, { passive: true });
  storiesViewer.addEventListener("touchend", resumeHandler, { passive: true });
  storiesViewer.addEventListener("touchcancel", resumeHandler, { passive: true });

  // Swipe gesture support
  let touchStartX = 0;
  let touchStartY = 0;
  storiesViewer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  storiesViewer.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 55 && Math.abs(diffY) < 65) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // Click handler for Open Letter button inside last slide
  slidesWrapper.addEventListener("click", (e) => {
    if (e.target && e.target.id === "openLetterBtn") {
      goToLetter();
    }
  });

  // Tutorial overlay automatic fade out
  if (storiesTutorial) {
    setTimeout(() => {
      storiesTutorial.classList.add("is-hidden");
      setTimeout(() => storiesTutorial.remove(), 500);
    }, 2800);
  }

  // Global background music mute controls (disabled on early chapters)
  if (musicToggleBtn) {
    musicToggleBtn.style.display = "none";
  }

  function updateMuteIcon(muted) {
    if (!musicToggleBtn) return;
    if (muted) {
      musicToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;
    } else {
      musicToggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
    }
  }
});

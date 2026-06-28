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

  function getTitleWithIcon(title) {
    if (!title) return "";
    if (title.startsWith("✨")) {
      return `<svg class="title-icon inline-sparkle-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #ffb347; margin-top: -0.2rem;"><path d="M12 2l2.4 5.2 5.6 2.4-5.6 2.4-2.4 5.2-2.4-5.2-5.6-2.4 5.6-2.4zM20 16l1.2 2.6 2.8 1.2-2.8 1.2-1.2 2.6-1.2-2.6-2.8-1.2 2.8-1.2zM6 15l1.2 2.6 2.8 1.2-2.8 1.2-1.2 2.6-1.2-2.6-2.8-1.2 2.8-1.2z"/></svg>${title.substring(2)}`;
    }
    if (title.startsWith("🌸")) {
      return `<svg class="title-icon inline-flower-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #ffabd0; margin-top: -0.2rem;"><path d="M12 2c-.55 0-1 .45-1 1v1.1c-.6-.06-1.22-.06-1.82 0l-.77-1.1c-.32-.45-.94-.57-1.4-.25s-.57.94-.25 1.4l.72 1.03c-.48.33-.92.73-1.3 1.18L5.14 4.34c-.38-.4-.99-.44-1.4-.06s-.44.99-.06 1.4l1.04 1.1c-.32.48-.59.99-.8 1.54l-1.32-.44c-.52-.17-1.1.1-1.27.62-.17.52.1 1.1.62 1.27l1.37.46c-.05.58-.05 1.18 0 1.76l-1.37.46c-.52.17-.8.75-.62 1.27.13.4.51.65.91.65.12 0 .24-.02.36-.06l1.32-.44c.21.55.48 1.06.8 1.54l-1.04 1.1c-.38.4-.35 1.02.06 1.4.2.19.46.29.72.29.24 0 .49-.09.68-.27l1.04-1.02c.38.45.82.85 1.3 1.18l-.72 1.03c-.32.46-.2 1.08.25 1.4.19.13.4.2.62.2.32 0 .63-.15.8-.4L10.18 19.9c.6.06 1.22.06 1.82 0l.77 1.1c.17.25.48.4.8.4.22 0 .43-.07.62-.2.45-.32.57-.94.25-1.4l-.72-1.03c.48-.33.92-.73 1.3-1.18l1.04 1.02c.19.18.44.27.68.27.26 0 .52-.1.72-.29.41-.38.44-1 .06-1.4l-1.04-1.1c.32-.48.59-.99.8-1.54l1.32.44c.12.04.24.06.36.06.4 0 .78-.25.91-.65.17-.52-.11-1.1-.62-1.27l-1.37-.46c.05-.58.05-1.18 0-1.76l1.37-.46c.52-.17.8-.75.62-1.27-.17-.52-.75-.8-1.27-.62l-1.32.44c-.21-.55-.48-1.06-.8-1.54l1.04-1.1c.38-.4.35-1.02-.06-1.4s-1.02-.35-1.4.06l-1.04 1.02c-.38-.45-.82-.85-1.3-1.18l.72-1.03c.32-.46.2-1.08-.25-1.4s-1.08-.2-1.4.25l-.77 1.1c-.6-.06-1.22-.06-1.82 0V3c0-.55-.45-1-1-1zm0 7c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>${title.substring(2)}`;
    }
    if (title.startsWith("📸")) {
      return `<svg class="title-icon inline-camera-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #a3b8cc; margin-top: -0.2rem;"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>${title.substring(2)}`;
    }
    if (title.startsWith("😂")) {
      return `<svg class="title-icon inline-laugh-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #ffb347; margin-top: -0.2rem;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 6c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>${title.substring(2)}`;
    }
    if (title.startsWith("❤️")) {
      return `<svg class="title-icon inline-heart-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #ff527c; margin-top: -0.2rem;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>${title.substring(2)}`;
    }
    if (title.startsWith("🌙")) {
      return `<svg class="title-icon inline-moon-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width: 1.6rem; height: 1.6rem; vertical-align: middle; margin-right: 0.5rem; display: inline-block; color: #d0c4de; margin-top: -0.2rem;"><path d="M12.1 22C6.52 22 2 17.48 2 11.9c0-4.75 3.27-8.73 7.82-9.72.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2-4.4 5.2-4.4 8.7 0 5 4 9 9 9 2.5 0 4.8-1 6.5-2.8.4-.4.9-.5 1.4-.3.5.2.8.7.7 1.2-.9 4.6-4.9 7.9-9.8 7.9z"/></svg>${title.substring(2)}`;
    }
    return title;
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
          <h3>${getTitleWithIcon(item.title)}</h3>
          <p>${item.text}</p>
          ${index === timelineData.length - 1 ? `
            <div class="final-action-card">
              <button id="openLetterBtn" class="primary-button" type="button" style="display: inline-flex; align-items: center; justify-content: center; margin: 1.5rem auto 0;">
                Read the Letter 
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 1.15rem; height: 1.15rem; margin-left: 0.4rem; display: inline-block; vertical-align: middle;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </button>
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

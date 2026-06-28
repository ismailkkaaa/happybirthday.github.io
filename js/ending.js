document.addEventListener("DOMContentLoaded", () => {
  const endingMontage = document.getElementById("endingMontage");
  const endingStars = document.getElementById("endingStars");
  const endingLine = document.getElementById("endingLine");
  const finalNote = document.getElementById("finalNote");

  if (!endingLine) return;

  const endingLines = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.endingLines)
    ? BirthdayConfig.endingLines
    : ["One last thing...", "Thank you for existing.", "Happy Birthday ❤️"];

  // 1. Spawns Twinkling Stars
  function spawnStars() {
    if (!endingStars) return;
    endingStars.innerHTML = "";
    const count = 45;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${0.1 + Math.random() * 0.2}rem`;
      star.style.height = star.style.width;
      star.style.animationDelay = `${Math.random() * -5}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      fragment.appendChild(star);
    }
    endingStars.appendChild(fragment);
  }

  // 2. Build Photo Montage Slideshow
  function photoBackground(photo, fallbackIndex) {
    if (photo) {
      return `url("${photo}")`;
    }
    const gradients = [
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #4a154b, #1a052e)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #1b0a2a, #030006)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #2a083d, #08020a)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #3d002a, #0a0007)",
    ];
    return gradients[fallbackIndex % gradients.length];
  }

  function startSlideshow() {
    if (!endingMontage) return;
    
    // Gather all photos from configuration
    const photos = [];
    if (typeof BirthdayConfig !== "undefined") {
      if (BirthdayConfig.storyTimeline) {
        BirthdayConfig.storyTimeline.forEach(item => {
          if (item.photo) photos.push(item.photo);
        });
      }
      if (BirthdayConfig.floatingMemories) {
        BirthdayConfig.floatingMemories.forEach(item => {
          if (item.photo) photos.push(item.photo);
        });
      }
    }

    // Fallback: If no custom photos are provided, generate gradient slides
    const totalSlides = photos.length > 0 ? photos.length : 4;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < totalSlides; i++) {
      const frame = document.createElement("div");
      frame.className = "montage-photo";
      const photoPath = photos[i] || "";
      frame.style.setProperty("--photo-bg", photoBackground(photoPath, i));
      fragment.appendChild(frame);
    }
    endingMontage.appendChild(fragment);

    const slides = document.querySelectorAll(".montage-photo");
    if (slides.length === 0) return;

    let currentIndex = 0;
    slides[0].classList.add("is-active");

    setInterval(() => {
      slides[currentIndex].classList.remove("is-active");
      currentIndex = (currentIndex + 1) % slides.length;
      
      // Force scaling reset for Ghibli Ken Burns zoom feel
      slides[currentIndex].style.transition = "none";
      slides[currentIndex].style.transform = "scale(1.08)";
      void slides[currentIndex].offsetWidth; // reflow
      
      slides[currentIndex].style.transition = "";
      slides[currentIndex].classList.add("is-active");
    }, 6000);
  }

  function getEndingLineWithIcon(line) {
    if (!line) return "";
    if (line.includes("❤️")) {
      return `${line.replace("❤️", "")} <span style="color: #ff527c; display: inline-flex; align-items: center; vertical-align: middle; margin-left: 0.4rem; margin-top: -0.25rem;"><svg viewBox="0 0 24 24" fill="currentColor" style="width: 2.2rem; height: 2.2rem;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
    }
    return line;
  }

  // 3. Play ending sequence (fade sentences one by one with drift transitions)
  function playTextSequence() {
    let lineIndex = 0;

    const nextLine = () => {
      // 1. Trigger exit/leaving animation for previous sentence
      endingLine.classList.remove("is-visible");
      if (endingLine.innerHTML) {
        endingLine.classList.add("is-leaving");
      }

      // 2. Wait for exit transition to complete, then load next text and fade in
      setTimeout(() => {
        endingLine.classList.remove("is-leaving");
        
        if (lineIndex < endingLines.length) {
          // Set data-index attribute to trigger unique CSS animations for each slide
          endingLine.setAttribute("data-index", lineIndex + 1);
          endingLine.innerHTML = getEndingLineWithIcon(endingLines[lineIndex]);
          endingLine.classList.add("is-visible");
          lineIndex++;
          
          // Show active text for 3.6s before fading out
          setTimeout(nextLine, 3600);
        } else {
          // Fade out final sentence completely
          endingLine.innerHTML = "";
          
          // Wait 2 seconds, then show the permanent final note
          setTimeout(() => {
            if (finalNote) {
              finalNote.classList.add("is-visible");
              
              // Fade out the background music volume smoothly after 5 seconds
              setTimeout(() => {
                if (typeof fadeOutMusic === "function") {
                  fadeOutMusic(3000); // 3-second gentle fade out
                }
              }, 5000);
            }
          }, 2000);
        }
      }, 1600); // 1.6s wait matches transition delay
    };

    // Begin sequence after a short initial delay when entering the page
    setTimeout(nextLine, 1200);
  }

  // Set dark body explicitly
  document.body.classList.add("is-dark");

  spawnStars();
  startSlideshow();
  playTextSequence();
});

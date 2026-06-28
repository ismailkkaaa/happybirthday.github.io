document.addEventListener("DOMContentLoaded", () => {
  const openGiftButton = document.getElementById("openGiftButton");

  if (openGiftButton) {
    openGiftButton.addEventListener("click", () => {
      // Prevent double trigger
      if (openGiftButton.classList.contains("is-open")) return;
      
      // 1. Play Opening Animation
      openGiftButton.classList.add("is-open");

      // 2. Spawn golden sparkles rising from box center
      const boxContainer = openGiftButton.querySelector(".luxury-gift");
      if (boxContainer) {
        spawnGoldSparkles(boxContainer);
      }

      // 3. Play continuous background music
      if (typeof startGlobalMusic === "function") {
        startGlobalMusic();
      }

      // 4. Navigate to next chapter with a slow, elegant transition delay
      setTimeout(() => {
        if (typeof navigateWithTransition === "function") {
          navigateWithTransition("gift.html");
        } else {
          window.location.href = "gift.html";
        }
      }, 2200); // 2.2 second delay to let the animation play out beautifully
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
      
      // Initial coordinate dispersals near lid seam
      const startX = (Math.random() - 0.5) * 60; // -30px to +30px range
      const startY = -10 + (Math.random() - 0.5) * 15;
      
      sparkle.style.setProperty("--startX", `${startX}px`);
      sparkle.style.setProperty("--startY", `${startY}px`);
      
      // Float trajectory calculations
      const moveX = (Math.random() - 0.5) * 120; // lateral drift
      const moveY = -130 - Math.random() * 110; // vertical drift upwards
      
      sparkle.style.setProperty("--moveX", `${moveX}px`);
      sparkle.style.setProperty("--moveY", `${moveY}px`);
      
      // Styles setup
      sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.fontSize = `${0.65 + Math.random() * 0.75}rem`;
      sparkle.style.animationDuration = `${1.3 + Math.random() * 1.1}s`;
      sparkle.style.animationDelay = `${Math.random() * 0.4}s`;
      
      container.appendChild(sparkle);
      
      // Automatically clean up sparkle element
      setTimeout(() => sparkle.remove(), 2500);
    }
  }
});

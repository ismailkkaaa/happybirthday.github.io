document.addEventListener("DOMContentLoaded", () => {
  const wishPrompt = document.getElementById("wishPrompt");
  const cakeSection = document.getElementById("cakeSection");
  const candleFlame = document.getElementById("candleFlame");
  const smokeTrail = document.getElementById("smokeTrail");
  const wishFlash = document.getElementById("wishFlash");
  const startWishBtn = document.getElementById("startWishBtn");
  const blowCandleBtn = document.getElementById("blowCandleBtn");
  const shakeInstruction = document.getElementById("shakeInstruction");

  if (!wishPrompt) return;

  const wishPrompts = [
    "Before we finish...",
    "Close your eyes.",
    "Make a birthday wish.",
    "When you're ready..."
  ];

  let promptIndex = 0;
  let isBlownOut = false;

  // 1. Text sequence player
  function nextPrompt() {
    if (promptIndex < wishPrompts.length) {
      wishPrompt.textContent = wishPrompts[promptIndex];
      wishPrompt.classList.add("is-visible");
      
      // Keep visible for 2.4s, then fade out
      setTimeout(() => {
        wishPrompt.classList.remove("is-visible");
        wishPrompt.classList.add("is-leaving");
        
        // Wait for exit transition to complete before playing next line
        setTimeout(() => {
          wishPrompt.classList.remove("is-leaving");
          promptIndex++;
          nextPrompt();
        }, 1500);
      }, 2400);
    } else {
      // Reveal the birthday cake and interaction controls
      showCakeSection();
    }
  }

  function showCakeSection() {
    cakeSection.classList.add("is-visible");
  }

  // Run sequence after a small layout buffer
  setTimeout(nextPrompt, 1200);

  // 2. Shake & Permission handlers
  startWishBtn.addEventListener("click", async () => {
    startWishBtn.classList.add("is-hidden");
    
    // iOS 13+ Devicemotion permission request
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === "granted") {
          activateShakeDetection();
        } else {
          showBlowButtonFallback();
        }
      } catch (error) {
        console.error("DeviceMotion permission error:", error);
        showBlowButtonFallback();
      }
    } else if (typeof DeviceMotionEvent !== "undefined") {
      // Android / older browser checks
      let hasMotionFired = false;
      const testMotion = () => {
        hasMotionFired = true;
        window.removeEventListener("devicemotion", testMotion);
        activateShakeDetection();
      };
      window.addEventListener("devicemotion", testMotion);
      
      // Accelerometer trigger buffer
      setTimeout(() => {
        if (!hasMotionFired) {
          window.removeEventListener("devicemotion", testMotion);
          showBlowButtonFallback();
        }
      }, 250);
    } else {
      showBlowButtonFallback();
    }
  });

  // Flame direct interaction triggers
  candleFlame.addEventListener("click", () => {
    triggerBlowOut();
  });
  candleFlame.addEventListener("touchstart", (e) => {
    e.preventDefault();
    triggerBlowOut();
  });

  blowCandleBtn.addEventListener("click", () => {
    triggerBlowOut();
  });

  function activateShakeDetection() {
    shakeInstruction.classList.remove("is-hidden");
    shakeInstruction.classList.add("is-visible");
    
    let lastX = null, lastY = null, lastZ = null;
    let shakeCounter = 0;
    const SHAKE_THRESHOLD = 10.5; // Lowered from 14 for better motion sensitivity/reliability

    const handleMotion = (event) => {
      if (isBlownOut) return;
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      let x = acc.x;
      let y = acc.y;
      let z = acc.z;

      if (lastX === null) {
        lastX = x;
        lastY = y;
        lastZ = z;
        return;
      }

      let deltaX = Math.abs(x - lastX);
      let deltaY = Math.abs(y - lastY);
      let deltaZ = Math.abs(z - lastZ);

      // Verify movement delta on multiple axes to register a genuine shake
      if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) || 
          (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) || 
          (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {
        shakeCounter++;
        if (shakeCounter >= 3) {
          triggerBlowOut();
          window.removeEventListener("devicemotion", handleMotion);
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);
  }

  function showBlowButtonFallback() {
    blowCandleBtn.classList.remove("is-hidden");
    blowCandleBtn.classList.add("is-visible");
  }

  // 3. Blowout animation sequence
  function triggerBlowOut() {
    if (isBlownOut) return;
    isBlownOut = true;

    // Dismiss trigger widgets
    shakeInstruction.classList.remove("is-visible");
    shakeInstruction.classList.add("is-hidden");
    blowCandleBtn.classList.remove("is-visible");
    blowCandleBtn.classList.add("is-hidden");

    // Extinguish candle flame
    candleFlame.classList.add("is-blown");
    
    // Trigger soft overlay glow flash
    wishFlash.classList.add("is-active");

    // Launch smoke trail
    setTimeout(() => {
      smokeTrail.classList.add("is-active");
    }, 100);

    // Disperse warm rising wish particles
    spawnGlowingParticles();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 120]);
    }

    // Redirect to Chapter 7 after 2.5 seconds
    setTimeout(() => {
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("ending.html");
      } else {
        window.location.href = "ending.html";
      }
    }, 2500);
  }

  // 4. Glow particle generator
  function spawnGlowingParticles() {
    const container = document.querySelector(".cake-section");
    if (!container) return;

    const count = 35;
    const colors = ["#ffebd6", "#ffd2a6", "#ffedb8", "#ffe6e6"];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "wish-particle";

      // Coordinate matching the tip of the wick (centered, 45px down)
      particle.style.left = `calc(50% + ${Math.random() * 20 - 10}px)`;
      particle.style.top = `calc(45px + ${Math.random() * 20 - 10}px)`;

      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      
      const vx = `${Math.random() * 140 - 70}px`;
      const vy = `${Math.random() * -180 - 45}px`;
      
      particle.style.setProperty("--vx", vx);
      particle.style.setProperty("--vy", vy);
      particle.style.animationDelay = `${Math.random() * 0.3}s`;
      particle.style.animationDuration = `${1.6 + Math.random() * 0.9}s`;

      container.appendChild(particle);

      // Cleanup
      setTimeout(() => {
        particle.remove();
      }, 2500);
    }
  }
});

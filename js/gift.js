document.addEventListener("DOMContentLoaded", () => {
  const giftGrid = document.getElementById("giftGrid");
  const huntMessage = document.getElementById("huntMessage");

  if (!giftGrid || !huntMessage) return;

  // 1. Randomly assign the correct box index between 0 and 4 on every refresh
  const correctIndex = Math.floor(Math.random() * 5);

  // 2. Load and extend incorrect hint messages
  const baseWrongMessages = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.wrongGiftMessages)
    ? BirthdayConfig.wrongGiftMessages
    : ["Not this one 🤭", "Try again princess 💕", "Almost there ❤️", "Keep looking ✨"];
  
  const wrongMessages = [...baseWrongMessages, "Nope... not this one 🥹"];

  // Array to keep track of already clicked/opened boxes
  const clickedIndices = [];
  let huntCompleted = false;

  function createGiftBox(index) {
    const button = document.createElement("button");
    button.className = "mini-gift";
    button.type = "button";
    button.setAttribute("aria-label", `Gift box ${index + 1}`);
    button.innerHTML = `
      <span class="luxury-gift" aria-hidden="true">
        <span class="gift-glow"></span>
        <img src="luxury_gift_box.png" class="gift-slice gift-lid-img" alt="" />
        <img src="luxury_gift_box.png" class="gift-slice gift-body-img" alt="" />
      </span>
    `;

    button.addEventListener("click", () => {
      // Guard clauses to prevent clicking completed games or double clicks
      if (huntCompleted) return;
      if (clickedIndices.includes(index)) return;

      // Register index as clicked and disable box immediately
      clickedIndices.push(index);
      button.disabled = true;
      button.style.pointerEvents = "none";

      if (index === correctIndex) {
        // Success path
        huntCompleted = true;
        button.classList.add("is-correct");
        huntMessage.textContent = "You found it! ❤️";

        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        // Wait 1.5 seconds, then transition to Chapter 3
        setTimeout(() => {
          if (typeof navigateWithTransition === "function") {
            navigateWithTransition("story.html");
          } else {
            window.location.href = "story.html";
          }
        }, 1500);
      } else {
        // Incorrect path: Trigger open-and-disabled visual shake state
        button.classList.add("is-wrong");

        // Pick one random cute message
        const randomMsg = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
        huntMessage.textContent = randomMsg;

        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    });

    return button;
  }

  // Generate the 5 randomized hunt slots
  for (let i = 0; i < 5; i++) {
    giftGrid.appendChild(createGiftBox(i));
  }
});

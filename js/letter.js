document.addEventListener("DOMContentLoaded", () => {
  const paperCard = document.querySelector(".paper-card");
  const typedLetter = document.getElementById("typedLetter");
  const letterSignature = document.querySelector(".letter-signature");
  const surpriseButton = document.getElementById("surpriseButton");

  if (!typedLetter) return;

  const letterText = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.letterText)
    ? BirthdayConfig.letterText
    : "Happy birthday...";

  const signatureText = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.letterSignature)
    ? BirthdayConfig.letterSignature
    : "With all my heart";

  // 1. Reveal Paper Card initially
  setTimeout(() => {
    if (paperCard) {
      paperCard.classList.add("is-visible");
      // Start typing after card arrives
      setTimeout(startTypewriter, 800);
    }
  }, 300);

  function startTypewriter() {
    let index = 0;
    let lastScrollHeight = document.documentElement.scrollHeight;
    
    // Smooth scroll typing context on mobile if page layout expands
    const autoScroll = () => {
      const currentHeight = document.documentElement.scrollHeight;
      if (currentHeight > lastScrollHeight) {
        window.scrollTo({
          top: currentHeight,
          behavior: "smooth"
        });
        lastScrollHeight = currentHeight;
      }
    };

    const type = () => {
      typedLetter.textContent = letterText.slice(0, index);
      index += 1;

      if (index <= letterText.length) {
        const delay = letterText[index - 1] === "." || letterText[index - 1] === "," ? 150 : (30 + Math.random() * 25);
        
        if (index % 6 === 0 && window.innerHeight < 780) {
          autoScroll();
        }

        setTimeout(type, delay);
      } else {
        // Typing finished
        typedLetter.classList.add("typing-done");
        revealSignatureAndButton();
      }
    };

    type();
  }

  function revealSignatureAndButton() {
    if (letterSignature) {
      letterSignature.textContent = signatureText;
      letterSignature.classList.add("is-visible");
    }

    setTimeout(() => {
      if (surpriseButton) {
        surpriseButton.classList.add("is-visible");
        
        // Smooth scroll to make sure button is visible on mobile
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 800);
  }

  // Handle transition to next page
  if (surpriseButton) {
    surpriseButton.addEventListener("click", () => {
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("surprise.html");
      } else {
        window.location.href = "surprise.html";
      }
    });
  }
});

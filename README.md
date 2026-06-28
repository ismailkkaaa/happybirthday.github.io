# Handcrafted Birthday Gift Website

A premium mobile-first birthday experience built as a small emotional journey instead of a normal landing page.

This project is a pure HTML, CSS, and JavaScript digital gift with soft animations, glassmorphism, a memory hunt, a story timeline, a handwritten-style letter, a surprise reveal, and a quiet emotional ending.

## Preview

Open `index.html` in any browser.

No build step. No framework. No dependencies except Google Fonts.

## Experience Flow

1. **Secret Invitation**
   A full-screen opening scene with floating particles, a glass card, and an animated gift box.

2. **Memory Hunt Game**
   Five gift boxes appear. Only one unlocks the next part of the journey. Wrong choices show cute playful messages.

3. **Our Story**
   A vertical mobile-friendly timeline with emotional story cards and photo placeholders.

4. **Birthday Letter**
   A dark elegant scene with a paper letter, handwritten typography, and a slow typewriter reveal.

5. **Surprise Box**
   A large animated gift opens dramatically, releasing floating memories and soft confetti.

6. **Emotional Ending**
   A minimal dark ending with a slow photo montage, floating stars, and timed emotional messages.

## Features

- Mobile-first responsive layout
- Pure HTML, CSS, and JavaScript
- Smooth scrolling and level transitions
- Glassmorphism UI
- Floating hearts, particles, stars, and soft confetti
- Animated gift boxes
- Scroll-revealed story timeline
- Typewriter letter animation
- Optional background music support
- Easy text and photo customization
- Fast static-site loading

## Folder Structure

```text
birthday gift website/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── README.md
```

## Customize

Most personal content lives in `js/main.js` inside the `content` object.

```js
const content = {
  correctGiftIndex: 2,
  wrongGiftMessages: ["Not this one", "Try again princess", "Almost there ❤️", "Keep looking ✨"],
  story: [],
  letter: "",
  floatingMemories: [],
  endingLines: [],
};
```

### Change the Letter

Edit the `letter` value in `js/main.js`.

### Change Story Cards

Edit the `story` array:

```js
{
  title: "✨ First Conversation",
  text: "Write your personal memory here.",
  photo: "assets/photos/first-conversation.jpg"
}
```

### Add Photos

Create a folder like this:

```text
assets/
└── photos/
    ├── first-conversation.jpg
    ├── favorite-photo.jpg
    └── best-memory.jpg
```

Then set the `photo` fields in `js/main.js`.

If a photo field is empty, the site uses a soft gradient placeholder.

### Add Background Music

Create:

```text
assets/
└── music/
    └── background.mp3
```

Then update the audio tag in `index.html`:

```html
<audio id="backgroundMusic" data-src="assets/music/background.mp3" loop preload="none"></audio>
```

Music starts only after the user taps the first gift, which keeps browser autoplay rules happy.

## Run Locally

Option 1: open `index.html` directly in your browser.

Option 2: serve it locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts

## Notes

This website is designed to feel personal. Replace the placeholder text and photos with real memories for the best effect.

The final screen intentionally has no restart button or call to action. It is meant to end quietly.

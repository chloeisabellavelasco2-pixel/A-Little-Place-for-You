/*
  EDITING GUIDE
  - Set PASSPHRASE to the word you want Khloe to enter. This is a sweet entry screen,
    not real security: a password stored in browser code can be viewed by visitors.
  - Add your legally obtained audio file to your project, then set MUSIC_FILE below.
  - LETTERS, PHOTOS, and CONFESSION_TEXT are the personal content to customize.
*/

const PASSPHRASE = "khloe"; // Change this to your own passphrase.
const MUSIC_FILE = ""; // Example: "assets/intertwine-chorus.mp3" (you provide the audio file).
const MUSIC_START_SECONDS = 58; // Change to the chorus start time in your audio file.

// Keep letter text as placeholders until you're ready to write your own messages.
const LETTERS = [
  { title: "A little hello", hint: "A note to begin", text: "[Write your own opening letter here. This placeholder is yours to replace.]" },
  { title: "A favorite memory", hint: "A moment to keep", text: "[Write about a memory you would like to share here.]" },
  { title: "Just because", hint: "A few kind words", text: "[Add any words you would like Khloe to read here.]" }
];

// Add your photos by replacing each empty src with a path, e.g. "images/photo-1.jpg".
// Use your own image files and captions; leave src empty to keep a pretty placeholder.
const PHOTOS = [
  { src: "", caption: "[Add a photo and an optional caption]" },
  { src: "", caption: "[A little moment worth remembering]" },
  { src: "", caption: "[Your caption goes here]" }
];

// The confession is intentionally an editable placeholder, not a pre-written love letter.
const CONFESSION_TEXT = "[Write your honest confession here. Share what you feel in your own words, and remember that she is free to feel or respond however she wishes.]";

const welcome = document.getElementById("welcome");
const unlockForm = document.getElementById("unlock-form");
const passphraseInput = document.getElementById("passphrase");
const formMessage = document.getElementById("form-message");
const site = document.getElementById("site");
const letterDialog = document.getElementById("letter-dialog");
const toast = document.getElementById("toast");
const audio = document.getElementById("background-audio");
const musicToggle = document.getElementById("music-toggle");
const musicLabel = document.getElementById("music-label");
let toastTimer;

// Build editable letter envelopes.
const letterGrid = document.getElementById("letter-grid");
LETTERS.forEach((letter, index) => {
  const card = document.createElement("article");
  card.className = "letter-card";
  const envelope = document.createElement("div");
  envelope.className = "envelope-icon";
  envelope.setAttribute("aria-hidden", "true");
  envelope.textContent = "♡";
  const title = document.createElement("h3");
  title.textContent = letter.title;
  const hint = document.createElement("p");
  hint.textContent = letter.hint;
  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "letter-open";
  openButton.setAttribute("aria-label", `Open letter ${index + 1}: ${letter.title}`);
  openButton.addEventListener("click", () => openLetter(letter));
  card.append(envelope, title, hint, openButton);
  letterGrid.append(card);
});

function openLetter(letter) {
  document.getElementById("dialog-title").textContent = letter.title;
  document.getElementById("dialog-copy").textContent = letter.text;
  if (typeof letterDialog.showModal === "function") {
    letterDialog.showModal();
  } else {
    // Older browser fallback: show a simple alert rather than leaving the button inert.
    window.alert(`${letter.title}\n\n${letter.text}`);
  }
}

document.getElementById("dialog-close").addEventListener("click", () => letterDialog.close());
letterDialog.addEventListener("click", (event) => {
  if (event.target === letterDialog) letterDialog.close();
});

// Render photos safely; empty paths create friendly, non-broken placeholders.
const galleryGrid = document.getElementById("gallery-grid");
PHOTOS.forEach((photo) => {
  const card = document.createElement("article");
  card.className = "gallery-card";
  const frame = document.createElement("div");
  frame.className = "gallery-image";
  if (photo.src.trim()) {
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.caption.startsWith("[") ? "Personal photo" : photo.caption;
    image.loading = "lazy";
    frame.append(image);
    image.addEventListener("error", () => {
      image.remove();
      addPhotoPlaceholder(frame);
      showToast(`Couldn't find ${photo.src}. Check the image path in script.js.`);
    }, { once: true });
  } else {
    addPhotoPlaceholder(frame);
  }
  const caption = document.createElement("p");
  caption.className = "gallery-caption";
  caption.textContent = photo.caption;
  card.append(frame, caption);
  galleryGrid.append(card);
});

function addPhotoPlaceholder(frame) {
  const placeholder = document.createElement("span");
  placeholder.className = "gallery-placeholder";
  placeholder.setAttribute("aria-label", "Photo placeholder");
  placeholder.textContent = "♡";
  frame.append(placeholder);
}

document.getElementById("confession-copy").textContent = CONFESSION_TEXT;

// Unlock with a little envelope-opening transition. Client-side passphrases are not secure.
unlockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passphraseInput.value.trim().toLocaleLowerCase() !== PASSPHRASE.toLocaleLowerCase()) {
    formMessage.textContent = "Not quite — try your little secret again.";
    passphraseInput.select();
    return;
  }
  formMessage.textContent = "";
  welcome.classList.add("is-opening");
  window.setTimeout(() => {
    welcome.hidden = true;
    site.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 950);
});

// Background music is optional. No remote song is bundled; use your own authorized file.
if (MUSIC_FILE.trim()) {
  audio.src = MUSIC_FILE;
  audio.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Math.min(Math.max(0, MUSIC_START_SECONDS), Math.max(0, audio.duration - 1));
    }
  });
  audio.addEventListener("error", () => showToast("Music couldn't be loaded. Check your audio file path in script.js."));
}

musicToggle.addEventListener("click", async () => {
  if (!MUSIC_FILE.trim()) {
    showToast("Add your legally obtained audio file path to MUSIC_FILE in script.js.");
    return;
  }
  if (audio.paused) {
    try {
      // Set the chorus position on each play after the first playback starts.
      if (audio.currentTime === 0) audio.currentTime = MUSIC_START_SECONDS;
      await audio.play();
      musicToggle.classList.add("is-playing");
      musicToggle.setAttribute("aria-pressed", "true");
      musicToggle.setAttribute("aria-label", "Pause background music");
      musicLabel.textContent = "Pause music";
    } catch (error) {
      showToast("The music couldn't start. Check the audio file and try again.");
    }
  } else {
    audio.pause();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Play background music");
    musicLabel.textContent = "A little music";
  }
});

audio.addEventListener("ended", () => {
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Play background music");
  musicLabel.textContent = "A little music";
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3800);
}

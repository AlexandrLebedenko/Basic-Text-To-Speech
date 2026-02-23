const speedOptions = document.querySelectorAll(".radio-btn");
const mainButton = document.querySelector(".button");
const dropdowns = document.querySelectorAll(".dropdown");
const activeRadio = document.querySelector('.radio-btn--active input[type="radio"]');
if (activeRadio) activeRadio.checked = true;
speedOptions.forEach((option) => {
  option.addEventListener("click", () => {
    // Delete the active class for everyone elements
    speedOptions.forEach((el) => {
      el.classList.remove("radio-btn--active");
      const radio = el.querySelector('input[type="radio"]');
      if (radio) radio.checked = false;
    });
    // Add the active class to the current element
    option.classList.add("radio-btn--active");
    const currentRadio = option.querySelector('input[type="radio"]');
    // Add the checked to the current element
    if (currentRadio) currentRadio.checked = true;
  });
});
// Switch dropdown menu function
function toggleMenu(dropdown, show) {
  const btn = dropdown.querySelector(".dropdown__toggle");
  const menu = dropdown.querySelector(".dropdown__menu");
  menu.classList.toggle("dropdown__menu--open", show);
  btn.setAttribute("aria-expanded", show ? "true" : "false");
}
// Close everything except the current
function closeOthers(current) {
  dropdowns.forEach((item) => {
    if (item !== current) toggleMenu(item, false);
  });
}
dropdowns.forEach((dropdown) => {
  const toggleBtn = dropdown.querySelector(".dropdown__toggle");
  const menu = dropdown.querySelector(".dropdown__menu");
  const options = menu.querySelectorAll(".dropdown__option");
  // Click on the button action
  toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
    closeOthers(dropdown);
    toggleMenu(dropdown, !isOpen);
  });
  // Select an option
  options.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      options.forEach((opt) => opt.setAttribute("aria-selected", "false"));
      this.setAttribute("aria-selected", "true");
      const selectedText = this.textContent.trim();
      const textSpan = toggleBtn.querySelector(".dropdown__toggle-text");
      textSpan.textContent = selectedText;
      // Close menu
      toggleMenu(dropdown, false);
    });
  });
  // Click outside dropdown
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) {
      toggleMenu(dropdown, false);
    }
  });
});
function getCurrentSpeed() {
  const activeLabel = document.querySelector(".radio-btn--active");
  const radio = activeLabel.querySelector('input[type="radio"]');
  return radio.value;
}
function getCurrentText() {
  const textarea = document.querySelector(".textarea");
  return textarea.value;
}
function getCurrentLanguage() {
  // Ищем dropdown без атрибута data-dropdown (языковой)
  const langDropdown = document.querySelector(".dropdown:not([data-dropdown])");
  const selectedOption = langDropdown.querySelector('.dropdown__option[aria-selected="true"]');
  return selectedOption.textContent.trim();
}
function getCurrentSpeaker() {
  // Ищем dropdown с атрибутом data-dropdown (список голосов)
  const speakerDropdown = document.querySelector(".dropdown[data-dropdown]");
  const selectedOption = speakerDropdown.querySelector('.dropdown__option[aria-selected="true"]');
  return selectedOption.dataset.value;
}
const synth = window.speechSynthesis;
let voices = [];
function loadVoices() {
  voices = synth.getVoices();
}
function findVoice(lang, speakerValue) {
  if (voices.length === 0) return null;
  let voice = voices.find((v) => v.lang === lang && v.name.toLowerCase().includes(speakerValue.toLowerCase()));
  if (!voice) voice = voices.find((v) => v.lang === lang);
  return voice || voices[0];
}
// The event is triggered when the list of votes changes (including during the first load)
synth.onvoiceschanged = loadVoices;
// Call immediately in case votes are ready (some browsers)
loadVoices();
mainButton.addEventListener("click", () => {
  if (synth.speaking) synth.cancel();
  const text = getCurrentText();
  if (!text.trim()) {
    alert("Please enter some text.");
    return;
  }
  const language = getCurrentLanguage();
  const speakerValue = getCurrentSpeaker();
  const speed = parseFloat(getCurrentSpeed());
  if (voices.length === 0) voices = synth.getVoices();
  const selectedVoice = findVoice(language, speakerValue);
  if (!selectedVoice) {
    alert("No suitable voice found.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.lang = language;
  utterance.rate = speed;
  synth.speak(utterance);
});

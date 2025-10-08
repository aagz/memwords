// ====================
// Utility Functions
// ====================

function playCurrentWordAudio() {
  const audioBtn = document.getElementById('audio-btn');
  if (audioBtn) audioBtn.disabled = true;
  if (currentList[currentWordIndex] && currentList[currentWordIndex].enAudio) {
    const audio = new Audio(currentList[currentWordIndex].enAudio);
    audio.play();
    audio.onended = () => {
      if (audioBtn) audioBtn.disabled = false;
    };
  } else {
    if (audioBtn) audioBtn.disabled = false;
  }
}

function playSuccessSound() {
  // Create a simple success beep using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequency in Hz
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Slide down

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

function playLevelCompletedSound() {
  const audio = new Audio('audio/sounds/level_completed.wav');
  audio.play();
}

function playFailSound() {
  const audio = new Audio('audio/sounds/fail.wav');
  audio.play();
}

function playCorrectSound() {
  const audio = new Audio('audio/sounds/correct.wav');
  audio.play();
}

function playGameOverSound() {
  const audio = new Audio('audio/sounds/game_over.wav');
  audio.play();
}

function playWinSound() {
  const audio = new Audio('audio/sounds/win.wav');
  audio.play();
}

function playWinSound() {
  const audio = new Audio('audio/sounds/win.wav');
  audio.play();
}

function playClickSound() {
  const audio = new Audio('audio/sounds/click.wav');
  audio.play();
}

function playCorrectSound() {
  const audio = new Audio('audio/sounds/correct.wav');
  audio.play();
}

let isPlayingLetter = false;

function playLetterAudio(letter) {
  // Removed the check to allow multiple plays
  const audio = new Audio(`audio/letters/${letter}.mp3`);
  audio.play();
  // Removed the flag setting
}

function showCompletion(message, buttonText, buttonAction) {
  document.getElementById('back-btn').style.display = 'block';
  const randomHuman = humanImages[Math.floor(Math.random() * humanImages.length)];
  const gameArea = document.getElementById('game-area');
  let buttonsHtml = '';
  if (Array.isArray(buttonText)) {
    for (let i = 0; i < buttonText.length; i++) {
      buttonsHtml += `<button class="menu-btn" onclick="${buttonAction[i]}">${buttonText[i]}</button>`;
    }
  } else {
    buttonsHtml = `<button class="menu-btn" onclick="${buttonAction}">${buttonText}</button>`;
  }
  gameArea.innerHTML = `
    <h2>🎉 Победа!</h2>
    <div id="victory-avatar" style="background-image: url(${randomHuman});"></div>
    <p id="victory-message">${message}</p>
    <div class="buttons-container">${buttonsHtml}</div>
  `;
  playWinSound();
}

function showGameOver(message, buttonText, buttonAction) {
  document.getElementById('back-btn').style.display = 'block';
  const gameArea = document.getElementById('game-area');
  let buttonsHtml = '';
  if (Array.isArray(buttonText)) {
    for (let i = 0; i < buttonText.length; i++) {
      buttonsHtml += `<button class="menu-btn" onclick="${buttonAction[i]}">${buttonText[i]}</button>`;
    }
  } else {
    buttonsHtml = `<button class="menu-btn" onclick="${buttonAction}">${buttonText}</button>`;
  }
  gameArea.innerHTML = `
    <h2>💔 Игра окончена!</h2>
    <p id="game-over-message">${message}</p>
    <div class="buttons-container">${buttonsHtml}</div>
  `;
  playGameOverSound();
}
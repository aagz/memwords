// Load word data
let wordsData = [];
let currentList = [];
let currentWordIndex = 0;
let currentGameMode = null;
let selectedListIndex = 0;
let lives = 5;
const TOTAL_TASKS = 15;

const headImages = [
    'img/heads/alien.png',
    'img/heads/pirate.png',
    'img/heads/pumpkin.png',
    'img/heads/stereoglasses.png',
    'img/heads/light_smile.png',
    'img/heads/smile.png',
    'img/heads/dartvader.png',
    'img/heads/skull.png'
];
const humanImages = [
    'img/humans/boxer.png',
    'img/humans/dino.png',
    'img/humans/emmet.png',
    'img/humans/jester.png',
    'img/humans/lory.png',
    'img/humans/ninja.png',
    'img/humans/ninja_black.png',
    'img/humans/ninja_orange.png',
    'img/humans/suit.png',
    'img/humans/superman.png',
    'img/humans/wolverine.png',
    'img/humans/astronaut.png',
    'img/humans/hulk.png',
    'img/humans/spiderman.png'
];

// ====================
// Data Loading
// ====================

async function loadWords() {
  try {
    const files = ['numbers_1_10.json', 'numbers_1_20.json', 'numbers_1_100.json', 'colors.json', 'school.json'];
    const responses = await Promise.all(files.map(file => fetch('words/' + file)));
    wordsData = await Promise.all(responses.map(r => r.json()));
    populateListSelect();
    setCurrentList(0); // Default to first list
    console.log('Words loaded:', wordsData.length, 'lists');
  } catch (error) {
    console.error('Error loading words:', error);
  }
}

function populateListSelect() {
  const select = document.getElementById('list-select');
  select.innerHTML = '';
  wordsData.forEach((list, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = list.name;
    select.appendChild(option);
  });
  select.addEventListener('change', (e) => setCurrentList(parseInt(e.target.value)));
}

function setCurrentList(index) {
  selectedListIndex = index;
  currentList = [...wordsData[index].words];
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Set random initial header image
  const randomHead = headImages[Math.floor(Math.random() * headImages.length)];
  document.getElementById('header-avatar').style.backgroundImage = `url(${randomHead})`;

  loadWords();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  }

  // Menu buttons
  document.getElementById('play-btn').addEventListener('click', () => startGame());

  // Back button
  document.getElementById('back-btn').addEventListener('click', showMenu);

  // Audio button
  document.getElementById('audio-btn').addEventListener('click', playCurrentWordAudio);
});

function startGame() {
  currentWordIndex = 0;
  lives = 5; // Reset lives
  setCurrentList(selectedListIndex); // Refresh current list
  // Shuffle the list
  for (let i = currentList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentList[i], currentList[j]] = [currentList[j], currentList[i]];
  }
  // Extend to 15 tasks by duplicating if needed
  const original = [...currentList];
  while (currentList.length < TOTAL_TASKS) {
    currentList.push(...original);
  }
  currentList = currentList.slice(0, TOTAL_TASKS);
  // Shuffle again for random order
  for (let i = currentList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentList[i], currentList[j]] = [currentList[j], currentList[i]];
  }
  updateProgress();
  updateLivesDisplay();

  // Set random header image
  const randomHead = headImages[Math.floor(Math.random() * headImages.length)];
  document.getElementById('header-avatar').style.backgroundImage = `url(${randomHead})`;

  // Hide menu, show back button
  const nav = document.querySelector('nav');
  nav.classList.remove('nav-menu');
  if (window.innerWidth < 600) {
    nav.classList.add('nav-game-mobile');
  } else {
    nav.classList.add('nav-game-desktop');
  }
  document.getElementById('back-btn').style.display = 'block';
  document.querySelector('main').style.display = 'block';
  document.getElementById('game-area').style.display = 'block';
  document.querySelector('main').style.marginTop = '50px';

  showRandomGame();
}

function showRandomGame() {
  const modes = ['scramble', 'matching', 'choice'];
  const randomMode = modes[Math.floor(Math.random() * modes.length)];
  currentGameMode = randomMode;

  if (randomMode === 'scramble') {
    showScrambleGame();
  } else if (randomMode === 'matching') {
    showMatchingGame();
  } else if (randomMode === 'choice') {
    showChoiceGame();
  }
}

function updateProgress() {
  const progress = (currentWordIndex / TOTAL_TASKS) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

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

function playGameOverSound() {
  const audio = new Audio('audio/sounds/game_over.wav');
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

function updateLivesDisplay() {
  const livesContainer = document.getElementById('lives');
  livesContainer.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const img = document.createElement('img');
    img.src = i < lives ? 'img/heart_full.png' : 'img/heart_empty.png';
    livesContainer.appendChild(img);
  }
}

function showScrambleGame() {
  document.getElementById('game-area').classList.remove('matching-mode', 'choice-mode');
  document.getElementById('game-area').classList.add('scramble-mode');
  const gameArea = document.getElementById('game-area');
  const word = currentList[currentWordIndex];
  const scrambled = scrambleWord(word.en);

  gameArea.innerHTML = `
        <div class="word-display">${word.ru} <button class="audio-btn-small" onclick="playCurrentWordAudio()"><img src="img/speaker.png" width="20" height="20" alt="Audio"></button></div>
        <div class="letters-container" id="letters-container">
            ${scrambled.split('').map(letter =>
                `<div class="letter" data-letter="${letter}">${letter}</div>`
            ).join('')}
        </div>
        <div class="word-result" id="word-result"></div>
        <button class="check-btn" id="check-btn">Check</button>
    `;

  // Add event listeners
  document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('click', () => selectLetter(letter));
    letter.addEventListener('click', () => playLetterAudio(letter.dataset.letter));
  });

  document.getElementById('check-btn').disabled = false;
  document.getElementById('check-btn').addEventListener('click', checkScrambleAnswer);
}

function scrambleWord(word) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('');
}

function selectLetter(letterElement) {
  const resultContainer = document.getElementById('word-result');
  const selectedLetter = letterElement.dataset.letter;

  // Create result letter element
  const resultLetter = document.createElement('div');
  resultLetter.className = 'result-letter';
  resultLetter.textContent = selectedLetter;
  resultLetter.dataset.letter = selectedLetter;
  resultLetter.addEventListener('click', () => removeLetter(resultLetter));

  resultContainer.appendChild(resultLetter);
  letterElement.style.opacity = '0';
  letterElement.style.pointerEvents = 'none';
}

function removeLetter(resultLetter) {
  const letter = resultLetter.dataset.letter;
  resultLetter.remove();

  // Show the letter back in container
  const letters = document.querySelectorAll('.letter');
  letters.forEach(l => {
    if (l.dataset.letter === letter && l.style.opacity === '0') {
      l.style.opacity = '1';
      l.style.pointerEvents = 'auto';
    }
  });
}

function checkScrambleAnswer() {
  const resultLetters = document.querySelectorAll('#word-result .result-letter');
  const userWord = Array.from(resultLetters).map(el => el.dataset.letter).join('');
  const correctWord = currentList[currentWordIndex].en;

  if (userWord === correctWord) {
    // Correct
    resultLetters.forEach(el => el.classList.add('correct'));
    playCorrectSound();
    playCurrentWordAudio();
    document.getElementById('check-btn').disabled = true;
    setTimeout(() => nextWord(), 2000);
  } else {
    // Incorrect
    resultLetters.forEach(el => el.classList.add('incorrect'));
    playFailSound();
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
      setTimeout(() => {
        playGameOverSound();
        showGameOver();
      }, 1000);
    } else {
      setTimeout(() => {
        resultLetters.forEach(el => el.classList.remove('incorrect'));
      }, 1000);
    }
  }
}

function nextWord() {
  currentWordIndex++;
  updateProgress();

  // Change header image for new task
  const randomHead = headImages[Math.floor(Math.random() * headImages.length)];
  document.getElementById('header-avatar').style.backgroundImage = `url(${randomHead})`;

  if (currentWordIndex < currentList.length) {
    showRandomGame();
  } else {
    showCompletion();
  }
}

function showCompletion() {
  document.getElementById('back-btn').style.display = 'none';
  const randomHuman = humanImages[Math.floor(Math.random() * humanImages.length)];
  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = `
        <h2>🎉 Победа!</h2>
        <div id="victory-avatar" style="background-image: url(${randomHuman});"></div>
        <p>Ты выполнил все задания!</p>
        <button class="menu-btn" onclick="showMenu()">Выйти</button>
    `;
  playWinSound();
}

function showGameOver() {
  document.getElementById('back-btn').style.display = 'none';
  const randomHuman = humanImages[Math.floor(Math.random() * humanImages.length)];
  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = `
        <h2>💔 Игра окончена!</h2>
        <div id="game-over-avatar" style="background-image: url(${randomHuman});"></div>
        <p>Все сердечки закончились, попробуй еще раз!</p>
        <button class="menu-btn" onclick="showMenu()">Выйти</button>
    `;
}

function showMatchingGame() {
  document.getElementById('game-area').classList.remove('scramble-mode', 'choice-mode');
  document.getElementById('game-area').classList.add('matching-mode');
  const gameArea = document.getElementById('game-area');
  const pairs = getRandomPairs(5);
  const enItems = pairs.map(p => ({ text: p.en, type: 'en', pairId: p.id }));
  const ruItems = pairs.map(p => ({ text: p.ru, type: 'ru', pairId: p.id }));

  // Shuffle within columns
  for (let i = enItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enItems[i], enItems[j]] = [enItems[j], enItems[i]];
  }
  for (let i = ruItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ruItems[i], ruItems[j]] = [ruItems[j], ruItems[i]];
  }

  gameArea.innerHTML = `
        <h2>Match the pairs</h2>
        <div class="matching-container">
            <div class="column">
                ${enItems.map((item, index) => `
                    <div class="pair-item" data-index="${index}" data-pair-id="${item.pairId}" data-type="${item.type}">
                        ${item.text}
                    </div>
                `).join('')}
            </div>
            <div class="column">
                ${ruItems.map((item, index) => `
                    <div class="pair-item" data-index="${index + 5}" data-pair-id="${item.pairId}" data-type="${item.type}">
                        ${item.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

  // Add event listeners
  document.querySelectorAll('.pair-item').forEach(item => {
    item.addEventListener('click', () => selectPairItem(item));
  });
}

function showChoiceGame() {
  document.getElementById('game-area').classList.remove('matching-mode', 'scramble-mode');
  document.getElementById('game-area').classList.add('choice-mode');
  const word = currentList[currentWordIndex];
  const showRussian = Math.random() < 0.5;
  const question = showRussian ? word.ru : word.en;
  const correctAnswer = showRussian ? word.en : word.ru;

  // Get 3 wrong options
  const wrongOptions = currentList
    .filter((w, i) => i !== currentWordIndex)
    .map(w => showRussian ? w.en : w.ru)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = `
        <div class="word-display">${question} <button class="audio-btn-small" onclick="playCurrentWordAudio()"><img src="img/speaker.png" width="20" height="20" alt="Audio"></button></div>
        <div class="choice-options">
            ${options.map(option =>
                `<button class="choice-btn" onclick="checkChoice('${option}', '${correctAnswer}')">${option}</button>`
            ).join('')}
        </div>
    `;
}

function checkChoice(selected, correct) {
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(btn => btn.disabled = true);

  const clickedBtn = Array.from(buttons).find(btn => btn.textContent === selected);

  if (selected === correct) {
    clickedBtn.classList.add('correct');
    playCorrectSound();
    playCurrentWordAudio();
    setTimeout(() => nextWord(), 2000);
  } else {
    clickedBtn.classList.add('incorrect');
    playFailSound();
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
      setTimeout(() => {
        playGameOverSound();
        showGameOver();
      }, 1000);
    } else {
      setTimeout(() => {
        clickedBtn.classList.remove('incorrect');
        buttons.forEach(btn => btn.disabled = false);
      }, 1000);
    }
  }
}

function getRandomPairs(count) {
  const uniqueWords = [];
  const used = new Set();
  const shuffled = [...currentList].sort(() => 0.5 - Math.random());
  for (const word of shuffled) {
    if (!used.has(word.en) && uniqueWords.length < count) {
      used.add(word.en);
      uniqueWords.push(word);
    }
  }
  return uniqueWords.map((word, index) => ({ ...word, id: index }));
}

let selectedItems = [];

function selectPairItem(item) {
  // Removed playClickSound()

  // Reset any incorrect highlights
  document.querySelectorAll('.pair-item.incorrect').forEach(el => {
    el.classList.remove('selected', 'incorrect');
  });
  selectedItems = selectedItems.filter(i => !i.classList.contains('incorrect'));

  const itemType = item.dataset.type;
  if (itemType === 'en') {
    // Play audio for English words
    const wordText = item.textContent.trim();
    const word = currentList.find(w => w.en === wordText);
    if (word) {
      const audio = new Audio(word.enAudio);
      audio.play();
    }
    // Continue with selection logic
  }

  const selectedType = selectedItems.length > 0 ? selectedItems[0].dataset.type : null;

  if (item.classList.contains('selected')) {
    // Deselect if already selected
    item.classList.remove('selected');
    selectedItems = selectedItems.filter(i => i !== item);
  } else if (selectedItems.length === 0) {
    // Select first item
    item.classList.add('selected');
    selectedItems.push(item);
  } else if (selectedItems.length === 1 && itemType === selectedType) {
    // Replace selection if same language
    selectedItems[0].classList.remove('selected');
    selectedItems = [item];
    item.classList.add('selected');
  } else if (selectedItems.length === 1 && itemType !== selectedType) {
    // Check pair if different language
    item.classList.add('selected');
    selectedItems.push(item);
    checkPair();
  }
}

function checkPair() {
  const [item1, item2] = selectedItems;
  if (item1.dataset.pairId === item2.dataset.pairId) {
    // Correct pair
    item1.classList.add('correct');
    item1.classList.remove('selected');
    item2.classList.add('correct');
    item2.classList.remove('selected');
    playCorrectSound();
    selectedItems = [];

    // Check if all pairs are matched
    const allItems = document.querySelectorAll('.pair-item');
    const correctPairs = Array.from(allItems).filter(item => item.classList.contains('correct')).length / 2;
    if (correctPairs === 5) {
      playLevelCompletedSound();
      if (lives < 5) {
        lives++;
        updateLivesDisplay();
      }
      setTimeout(() => nextWord(), 2000);
    }
  } else {
    // Incorrect pair
    item1.classList.add('incorrect');
    item2.classList.add('incorrect');
    playFailSound();
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
      setTimeout(() => {
        playGameOverSound();
        showGameOver();
      }, 1000);
    } else {
      setTimeout(() => {
        item1.classList.remove('selected', 'incorrect');
        item2.classList.remove('selected', 'incorrect');
        selectedItems = [];
      }, 1000);
    }
  }
}

function showMenu() {
  const nav = document.querySelector('nav');
  nav.classList.remove('nav-game-desktop', 'nav-game-mobile');
  nav.classList.add('nav-menu');
  document.querySelector('main').style.display = 'none';
  document.getElementById('game-area').innerHTML = '';
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('game-area').classList.remove('matching-mode', 'scramble-mode');
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('lives').innerHTML = '';
  document.getElementById('audio-btn') && (document.getElementById('audio-btn').style.display = 'none');
  currentGameMode = null;
}
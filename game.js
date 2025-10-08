// ====================
// Game Functions
// ====================

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
  document.getElementById('menu-nav').style.display = 'none';
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

function nextWord() {
  currentWordIndex++;
  updateProgress();

  // Change header image for new task
  const randomHead = headImages[Math.floor(Math.random() * headImages.length)];
  document.getElementById('header-avatar').style.backgroundImage = `url(${randomHead})`;

  if (currentWordIndex < currentList.length) {
    showRandomGame();
  } else {
    showCompletion("Ты выполнил все задания!", ["Попробовать снова", "Выбрать список"], [`startGame()`, "showMenu()"]);
  }
}



function showScrambleGame() {
  document.getElementById('game-area').classList.remove('matching-mode', 'choice-mode');
  document.getElementById('game-area').classList.add('scramble-mode');
  const gameArea = document.getElementById('game-area');
  const word = currentList[currentWordIndex];
  const scrambled = scrambleWord(word.en);

  gameArea.innerHTML = `
        <h2>Составь слово</h2>
        <div class="word-display">${word.ru} <button class="audio-btn-small" onclick="playCurrentWordAudio()"><img src="img/speaker.png" width="20" height="20" alt="Audio"></button></div>
        <div class="word-result" id="word-result"></div>
        <div class="letters-container" id="letters-container">
            ${scrambled.split('').map(letter =>
                `<div class="letter" data-letter="${letter}">${letter}</div>`
            ).join('')}
        </div>
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
        <h2>Собери пары</h2>
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
        <h2>Выбери перевод</h2>
        <div class="word-display">${question} <button class="audio-btn-small" onclick="playCurrentWordAudio()"><img src="img/speaker.png" width="20" height="20" alt="Audio"></button></div>
        <div class="choice-options">
            ${options.map(option =>
                `<button class="choice-btn" onclick="checkChoice('${option}', '${correctAnswer}')">${option}</button>`
            ).join('')}
        </div>
    `;
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
        showGameOver("Все сердечки закончились, попробуй еще раз!", ["Попробовать снова", "Выйти"], [`startGame()`, "showMenu()"]);
      }, 1000);
    } else {
      setTimeout(() => {
        resultLetters.forEach(el => el.classList.remove('incorrect'));
      }, 1000);
    }
  }
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
        showGameOver("Все сердечки закончились, попробуй еще раз!", ["Попробовать снова", "Выйти"], [`startGame()`, "showMenu()"]);
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
        showGameOver("Все сердечки закончились, попробуй еще раз!", ["Попробовать снова", "Выйти"], [`startGame()`, "showMenu()"]);
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
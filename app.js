// Load word data
let wordsData = [];
let currentList = [];
let currentWordIndex = 0;
let currentGameMode = null;
let lives = 5;

async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        wordsData = data.lists[0].words; // Using first list (Numbers)
        currentList = [...wordsData];
        console.log('Words loaded:', wordsData.length);
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadWords();

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
    }

    // Menu buttons
    document.getElementById('scramble-btn').addEventListener('click', () => startGame('scramble'));
    document.getElementById('matching-btn').addEventListener('click', () => startGame('matching'));

    // Back button
    document.getElementById('back-btn').addEventListener('click', showMenu);

    // Audio button
    document.getElementById('audio-btn').addEventListener('click', playCurrentWordAudio);
});

function startGame(mode) {
    currentGameMode = mode;
    currentWordIndex = 0;
    lives = 5; // Reset lives
    currentList = [...wordsData]; // Reset list
    // Shuffle the list
    for (let i = currentList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentList[i], currentList[j]] = [currentList[j], currentList[i]];
    }
    updateProgress();
    updateLivesDisplay();

    // Hide menu, show back button
    document.querySelector('nav').style.display = 'none';
    document.getElementById('back-btn').style.display = 'block';

    if (mode === 'scramble') {
        showScrambleGame();
    } else if (mode === 'matching') {
        showMatchingGame();
    }
}

function updateProgress() {
    const progress = (currentWordIndex / currentList.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function playCurrentWordAudio() {
    if (currentList[currentWordIndex] && currentList[currentWordIndex].enAudio) {
        const audio = new Audio(currentList[currentWordIndex].enAudio);
        audio.play();
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

function playClickSound() {
    const audio = new Audio('audio/sounds/click.wav');
    audio.play();
}

function playCorrectSound() {
    const audio = new Audio('audio/sounds/correct.wav');
    audio.play();
}

function playLetterAudio(letter) {
    const audio = new Audio(`audio/letters/${letter}.mp3`);
    audio.play();
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
    const gameArea = document.getElementById('game-area');
    const word = currentList[currentWordIndex];
    const scrambled = scrambleWord(word.en);

    gameArea.innerHTML = `
        <div class="word-display">${word.ru}</div>
        <div class="letters-container" id="letters-container">
            ${scrambled.split('').map(letter => `<div class="letter" data-letter="${letter}">${letter}</div>`).join('')}
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
    if (currentWordIndex < currentList.length) {
        if (currentGameMode === 'scramble') {
            showScrambleGame();
        } else {
            showMatchingGame();
        }
    } else {
        showCompletion();
    }
}

function showCompletion() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
        <h2>🎉 Congratulations!</h2>
        <p>You've completed all words!</p>
        <button class="menu-btn" onclick="showMenu()">Choose Mode</button>
    `;
}

function showGameOver() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = `
        <h2>💔 Game Over!</h2>
        <p>You've lost all lives. Try again!</p>
        <button class="menu-btn" onclick="showMenu()">Choose Mode</button>
    `;
}

function showMatchingGame() {
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
                        <button class="audio-btn-small" data-audio="${pairs.find(p => p.id == item.pairId).enAudio}">🔊</button>
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

    document.querySelectorAll('.audio-btn-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const audioSrc = btn.dataset.audio;
            const audio = new Audio(audioSrc);
            audio.play();
        });
    });
}

function getRandomPairs(count) {
    const shuffled = [...currentList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((word, index) => ({ ...word, id: index }));
}

let selectedItems = [];

function selectPairItem(item) {
    playClickSound();
    if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        selectedItems = selectedItems.filter(i => i !== item);
    } else if (selectedItems.length < 2) {
        item.classList.add('selected');
        selectedItems.push(item);

        if (selectedItems.length === 2) {
            checkPair();
        }
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
    document.querySelector('nav').style.display = 'block';
    document.getElementById('game-area').innerHTML = '';
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('lives').innerHTML = '';
    currentGameMode = null;
}
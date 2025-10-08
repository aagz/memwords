// ====================
// UI Functions
// ====================

let currentSubject = null;

function selectSubject(subject) {
  console.log('selectSubject called with:', subject);
  currentSubject = subject;
  if (subject === 'english') {
    showEnglishMenu();
  } else if (subject === 'math') {
    showMathMenu();
  }
}

function showSubjectSelection() {
  document.querySelector('main').style.display = 'none';
  document.getElementById('subject-selection').style.display = 'flex';
  document.getElementById('menu-nav').style.display = 'none';
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
}

function showEnglishMenu() {
  document.querySelector('main').style.display = 'none';
  document.getElementById('subject-selection').style.display = 'none';
  document.getElementById('menu-nav').style.display = 'flex';
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('back-btn').style.display = 'block';
}

function showMathMenu() {
  document.querySelector('main').style.display = 'block';
  document.getElementById('subject-selection').style.display = 'none';
  document.getElementById('menu-nav').style.display = 'none';
  document.getElementById('game-area').innerHTML = `
    <div id="math-mode-selection" style="display: block;">
      <h2>Выберите режим:</h2>
      <button class="mode-btn" id="add-sub-btn">Сложение и вычитание</button>
      <button class="mode-btn" id="mult-btn">Таблица умножения</button>
    </div>
  `;
  document.getElementById('game-area').style.display = 'block';
  document.getElementById('back-btn').style.display = 'block';
  // Add event listeners
  document.getElementById('add-sub-btn').addEventListener('click', () => startMathMode('add-sub'));
  document.getElementById('mult-btn').addEventListener('click', () => startMathMode('mult'));
}

function showMathModeSelection() {
  document.getElementById('math-mode-selection').style.display = 'block';
}

function startMathMode(mode) {
  currentMathMode = mode;
  lives = 5;
  currentMathIndex = 0;
  mathScore = 0;
  updateLivesDisplay(lives);
  document.getElementById('math-mode-selection').style.display = 'none';
  generateMathTasks(mode);
  showMathTask();
}

function showMenu() {
  console.log('showMenu called, currentSubject:', currentSubject);
  const nav = document.querySelector('nav');
  nav.classList.remove('nav-game-desktop', 'nav-game-mobile');
  nav.classList.add('nav-menu');
  document.querySelector('main').style.display = 'none';
  document.getElementById('game-area').classList.remove('matching-mode', 'scramble-mode');
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('lives').innerHTML = '';
  document.getElementById('audio-btn') && (document.getElementById('audio-btn').style.display = 'none');
  currentGameMode = null;
  if (currentSubject === 'english') {
    document.getElementById('game-area').innerHTML = '';
    document.getElementById('game-area').style.display = 'none';
    showEnglishMenu();
  } else if (currentSubject === 'math') {
    showMathMenu();
  } else {
    document.getElementById('game-area').innerHTML = '';
    document.getElementById('game-area').style.display = 'none';
    showSubjectSelection();
  }
}

function updateProgress() {
  const progress = (currentWordIndex / TOTAL_TASKS) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateLivesDisplay(livesCount = lives) {
  const livesContainer = document.getElementById('lives');
  livesContainer.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const img = document.createElement('img');
    img.src = i < (5 - livesCount) ? 'img/heart_empty.png' : 'img/heart_full.png';
    livesContainer.appendChild(img);
  }
}
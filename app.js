// ====================
// Main App Initialization
// ====================

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await loadAssets();
  // Set random initial header image
  const randomHead = headImages[Math.floor(Math.random() * headImages.length)];
  document.getElementById('header-avatar').style.backgroundImage = `url(${randomHead})`;

  loadWords();

  // Subject selection
  document.getElementById('english-btn').addEventListener('click', () => selectSubject('english'));
  document.getElementById('math-btn').addEventListener('click', () => selectSubject('math'));

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  }

  // Menu buttons
  document.getElementById('play-btn').addEventListener('click', () => startGame());

  // Math mode buttons
  document.getElementById('add-sub-btn').addEventListener('click', () => startMathMode('add-sub'));
  document.getElementById('mult-btn').addEventListener('click', () => startMathMode('mult'));

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    if (currentSubject === 'english' && document.getElementById('menu-nav').style.display !== 'none') {
      showSubjectSelection();
    } else if (currentSubject === 'math') {
      showSubjectSelection();
    } else {
      showMenu();
    }
  });

  // Audio button
  document.getElementById('audio-btn').addEventListener('click', playCurrentWordAudio);
});
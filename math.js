// ====================
// Math Exercises
// ====================

let mathTasks = [];
let currentMathIndex = 0;
let mathScore = 0;
let currentMathMode = null;
let mathLives = 5;



function generateMathTasks(mode) {
  mathTasks = [];

  if (mode === 'add-sub') {
    // Addition and Subtraction up to 100 (mixed)
    for (let i = 0; i < TOTAL_TASKS; i++) {
      const isAddition = Math.random() < 0.5;
      let a, b, correct, question;
      if (isAddition) {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * (100 - a)) + 1;
        correct = a + b;
        question = `${a} + ${b} = ?`;
      } else {
        a = Math.floor(Math.random() * 100) + 1;
        b = Math.floor(Math.random() * a) + 1;
        correct = a - b;
        question = `${a} - ${b} = ?`;
      }
      const options = generateOptions(correct);
      mathTasks.push({
        question: question,
        correct: correct,
        options: options
      });
    }
  } else if (mode === 'mult') {
    // Multiplication table up to 10
    for (let i = 0; i < TOTAL_TASKS; i++) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const correct = a * b;
      const options = generateOptions(correct, true);
      mathTasks.push({
        question: `${a} × ${b} = ?`,
        correct: correct,
        options: options
      });
    }
  }

  // Shuffle tasks
  mathTasks.sort(() => 0.5 - Math.random());
}

function generateOptions(correct, isMultiplication = false) {
  const options = [correct];
  while (options.length < 4) {
    let wrong;
    if (isMultiplication) {
      wrong = correct + Math.floor(Math.random() * 20) - 10;
      wrong = Math.max(1, wrong);
    } else {
      wrong = correct + Math.floor(Math.random() * 20) - 10;
      wrong = Math.max(0, wrong);
    }
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
  }
  return options.sort(() => 0.5 - Math.random());
}

function showMathTask() {
  updateMathProgress();
  const task = mathTasks[currentMathIndex];
  const gameArea = document.getElementById('game-area');
  gameArea.innerHTML = `
    <h2>Математика</h2>
    <div class="word-display">${task.question}</div>
    <div class="choice-options">
      ${task.options.map(option =>
        `<button class="choice-btn" onclick="checkMathAnswer(${option}, ${task.correct})">${option}</button>`
      ).join('')}
    </div>
  `;
}

function updateMathProgress() {
  const progress = (currentMathIndex / mathTasks.length) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function checkMathAnswer(selected, correct) {
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach(btn => btn.disabled = true);

  const clickedBtn = Array.from(buttons).find(btn => btn.textContent == selected);

  if (selected === correct) {
    clickedBtn.classList.add('correct');
    playCorrectSound();
    mathScore++;
    setTimeout(() => {
      currentMathIndex++;
      if (currentMathIndex >= mathTasks.length) {
        showCompletion("Ты выполнил все задания!", ["Попробовать снова", "Выбрать режим"], [`resetMath('${currentMathMode}')`, "showMathMenu()"]);
      } else {
        showMathTask();
      }
    }, 1000);
  } else {
    clickedBtn.classList.add('incorrect');
    playFailSound();
    mathLives--;
    updateLivesDisplay(mathLives);
    // Show correct answer
    const correctBtn = Array.from(buttons).find(btn => btn.textContent == correct);
    correctBtn.classList.add('correct');
    setTimeout(() => {
      if (mathLives <= 0) {
        showGameOver("Все сердечки закончились, попробуй еще раз!", ["Попробовать снова", "Выбрать режим"], [`resetMath('${currentMathMode}')`, "showMathMenu()"]);
      } else {
        currentMathIndex++;
        if (currentMathIndex >= mathTasks.length) {
          showCompletion("Ты выполнил все задания!", ["Попробовать снова", "Выбрать режим"], [`resetMath('${currentMathMode}')`, "showMathMenu()"]);
        } else {
          showMathTask();
        }
      }
    }, 2000);
  }
}





function resetMath(mode) {
  currentMathIndex = 0;
  mathScore = 0;
  generateMathTasks(mode);
  showMathTask();
}
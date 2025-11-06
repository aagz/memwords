// ====================
// Data and Constants
// ====================

let headImages = [];
let humanImages = [];
let audioFiles = [];

// Global variables
let wordsData = [];
let currentList = [];
let currentWordIndex = 0;
let currentGameMode = null;
let selectedListIndex = 0;
let lives = 5;
const TOTAL_TASKS = 15;

// ====================
// Data Loading
// ====================

async function loadAssets() {
  try {
    const response = await fetch('assets.json');
    const data = await response.json();
    headImages = data.headImages;
    humanImages = data.humanImages;
    audioFiles = data.audioFiles || [];
    return data.wordLists;
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
}

async function loadWords() {
  try {
    const wordListPaths = await loadAssets();
    const wordResponses = await Promise.all(wordListPaths.map(file => fetch(file)));
    wordsData = await Promise.all(wordResponses.map(r => r.json()));
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
const fs = require('fs');
const path = require('path');

const imagesDir = 'img';
const headsDir = path.join(imagesDir, 'heads');
const humansDir = path.join(imagesDir, 'humans');
const wordsDir = 'words';
const audioDir = 'audio';
const assetsJsonPath = 'assets.json';

function getPngFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return [];
  }
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.png'))
    .map(file => path.join(dir, file).replace(/\\/g, '/')); // Normalize path separators
}

function getJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return [];
  }
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dir, file).replace(/\\/g, '/')); // Normalize path separators
}

function getAudioFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return [];
  }
  const files = [];
  function scanDir(currentDir, relativePath) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const relPath = path.join(relativePath, item).replace(/\\/g, '/');
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, relPath);
      } else if (item.endsWith('.mp3') || item.endsWith('.wav')) {
        files.push(relPath);
      }
    }
  }
  scanDir(dir, dir);
  return files;
}

function updateAssetsJson() {
  const headImages = getPngFiles(headsDir);
  const humanImages = getPngFiles(humansDir);
  const wordLists = getJsonFiles(wordsDir);
  const audioFiles = getAudioFiles(audioDir);

  const data = {
    headImages: headImages,
    humanImages: humanImages,
    wordLists: wordLists,
    audioFiles: audioFiles
  };

  fs.writeFileSync(assetsJsonPath, JSON.stringify(data, null, 2));
  console.log('assets.json updated successfully');
  console.log('headImages:', headImages.length, 'files');
  console.log('humanImages:', humanImages.length, 'files');
  console.log('wordLists:', wordLists.length, 'files');
  console.log('audioFiles:', audioFiles.length, 'files');
}

updateAssetsJson();
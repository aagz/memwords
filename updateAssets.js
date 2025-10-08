const fs = require('fs');
const path = require('path');

const imagesDir = 'img';
const headsDir = path.join(imagesDir, 'heads');
const humansDir = path.join(imagesDir, 'humans');
const wordsDir = 'words';
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

function updateAssetsJson() {
  const headImages = getPngFiles(headsDir);
  const humanImages = getPngFiles(humansDir);
  const wordLists = getJsonFiles(wordsDir);

  const data = {
    headImages: headImages,
    humanImages: humanImages,
    wordLists: wordLists
  };

  fs.writeFileSync(assetsJsonPath, JSON.stringify(data, null, 2));
  console.log('assets.json updated successfully');
  console.log('headImages:', headImages.length, 'files');
  console.log('humanImages:', humanImages.length, 'files');
  console.log('wordLists:', wordLists.length, 'files');
}

updateAssetsJson();
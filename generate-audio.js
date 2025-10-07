const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');

// npm install node-fetch

async function generateAudio() {
    const data = JSON.parse(fs.readFileSync('words.json', 'utf8'));
    const audioDir = path.join(__dirname, 'audio');

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir);
    }

    for (const list of data.lists) {
        for (const word of list.words) {
            // English
            if (word.en) {
                const enFile = `audio/words/${word.en.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
                if (!fs.existsSync(enFile)) {
                    await downloadAudio(word.en, 'en', enFile);
                }
                word.enAudio = enFile;
            }

            // Remove ruAudio if exists
            if (word.ruAudio) {
                delete word.ruAudio;
            }
        }
    }

    fs.writeFileSync('words.json', JSON.stringify(data, null, 2));

    // Generate audio for letters
    const lettersDir = path.join(audioDir, 'letters');
    if (!fs.existsSync(lettersDir)) {
        fs.mkdirSync(lettersDir);
    }

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (const letter of letters) {
        const letterFile = path.join(lettersDir, `${letter}.mp3`);
        if (!fs.existsSync(letterFile)) {
            await downloadAudio(letter, 'en', letterFile);
        }
    }

    console.log('Audio generation complete');
}

async function downloadAudio(text, lang, filePath) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Saved ${filePath}`);
}

generateAudio().catch(console.error);
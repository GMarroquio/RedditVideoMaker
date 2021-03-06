const fs = require("fs");
const tts = require("@google-cloud/text-to-speech");
const util = require("util");
const credentials = require("../../../credentials/tts.json");
const client = new tts.TextToSpeechClient({ credentials });

async function baixaAudio({ story: script, title }) {
  for (const [numPar, paragrafo] of script.entries()) {
    const frases = paragrafo.split(/(?<=[.,?!:]\s)/);
    for (const [idFrase, frase] of frases.entries()) {
      if (frase.length > 0) {
        var retry = 0;
        var success = false;
        const nome = `dist/audio/${numPar + 1}.${idFrase + 1}.mp3`;
        const request = {
          input: { text: frase },
          voice: { languageCode: "en-US", name: "en-US-Wavenet-E" },
          audioConfig: { audioEncoding: "LINEAR16" },
        };
        console.log(`> Downloading ${numPar + 1}.${idFrase + 1}.mp3`);
        while (retry < 5 && !success) {
          try {
            const [response] = await client.synthesizeSpeech(request);
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(nome, response.audioContent, "binary");
            success = true;
          } catch (err) {
            retry++;
            console.log(
              `> Retry ${retry} - Downloading ${numPar + 1}.${idFrase + 1}.mp3`
            );
          }
        }
        if (!success) process.exit(1);
      }
    }
  }
  const nome = `dist/audio/Title.mp3`;
  const request = {
    input: { text: title },
    voice: { languageCode: "en-US", name: "en-US-Wavenet-E" },
    audioConfig: { audioEncoding: "LINEAR16" },
  };
  console.log(`> Downloading Title.mp3`);

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(nome, response.audioContent, "binary");
}

module.exports = { baixaAudio };

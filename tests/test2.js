const { SyncLyrics } = require("../dist/index.js");
const fs = require('node:fs')

const LyricsManager = new SyncLyrics({
    // logLevel: 'debug',
    saveMusixmatchToken: (tokenData) => {
        fs.writeFileSync('/tmp/musixmatchToken.json', JSON.stringify(tokenData, null, 4))
    },
    getMusixmatchToken: () => {
        if (fs.existsSync('/tmp/musixmatchToken.json')) return JSON.parse(fs.readFileSync('/tmp/musixmatchToken.json', 'utf-8'))
        return null;
    },
})

setInterval(async () => {
    const l = await LyricsManager.getLyrics({
        track: "drunk text",
        artist: "Henry Moodie",
        album: "in all of my lonely nights"
    })
    
    console.log(l)
}, 500)
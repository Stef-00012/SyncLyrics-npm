const { SyncLyrics } = require("../dist/index.min.js");
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

// const trackId = LyricsManager.getTrackId({
//     /* Each of those options is optional but atleast one is required excluded length */
//     track: "drunk text", // Song name
//     artist: "Henry Moodie", // Song artist
//     album: "in all of my lonely nights", // Song album
//     length: 175000, // Song duration, in ms
// })

// LyricsManager.getLyrics({
//     /* Each of those options is optional but atleast one is required excluded length */
//     track: "drunk text", // Song name
//     artist: "Henry Moodie", // Song artist
//     album: "in all of my lonely nights", // Song album
//     length: 175000, // Song duration, in ms
//     lyricsType: []
// }).then(data => {
//     console.log(data.lyrics)
// })

setInterval(async () => {
    const l = await LyricsManager.getLyrics({
        track: "drunk text",
        artist: "Henry Moodie",
        album: "in all of my lonely nights"
    })
    
    console.log(l)
}, 500)
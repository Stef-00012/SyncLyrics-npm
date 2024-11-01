const { SyncLyrics } = require("../dist/index.js");

const LyricsManager = new SyncLyrics()

LyricsManager.getLyrics({
    track: "Small",
    artist: "Lauren Spencer Smith"
}).then(x => console.log(x.parse()))
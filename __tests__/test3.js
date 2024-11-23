const { SyncLyrics } = require('../dist/index.js')

const LyricsManager = new SyncLyrics()

LyricsManager.getLyrics({
    artist: "Matt Hansen",
    track: "something to remember",
    album: "something to remember"
}).then(song => {
    const lyrics = song.lyrics.lineSynced.lyrics

    console.log(lyrics)

    const parsed = LyricsManager.parseLyrics(lyrics)

    console.log(parsed)
})
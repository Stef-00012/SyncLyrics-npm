# @stef-0012/synclyrics (SyncLyrics)

SyncLyrics allows you to get the plain, line synced and word synced lyrics of any song avaible on [Musixmatch](https://musixmatch.com), [LrcLib.net](https://lrclib.net) or [Netease](https://music.xianqiao.wang).

**Installation**: `npm i @stef-0012/synclyrics`.

# Usage

```js
const { SyncLyrics } = require("@stef-0012/synclyrics");

let mxmToken; // This is just for the custom save/get functions example

const LyricsManager = new SyncLyrics({
    /* Each of those options is optional */
    cache: new Map(), // Anything that can store data and has a .set(K, V), .get(K) and .has(K) values
    logLevel: 'none', // One of "none" | "info" | "warn" | "error" | "debug"
    instrumentalLyricsIndicator: "", // Any string
    sources: ["musixmatch", "lrclib", "netease"], // An array with atleast one of those sources
    saveMusixmatchToken: (tokenData) => { // A custom function to save the Musixmatch token, otherwise it'll skip Musixmatch fetch
        mxmToken = tokenData;
    },
    getMusixmatchToken: () => { // A custom function to save the Musixmatch token, otherwise it'll skip Musixmatch fetch
        return mxmToken;
    },
})

LyricsManager.getLyrics({
    /* Each of those options is optional but atleast one is required excluded length */
    track: "the old me", // Song name
    artist: "Henry Moodie", // Song artist
    album: "good old days", // Song album
    length: 175000, // Song duration, in ms
}).then(data => {
    console.log(data)
}) // Array of objects with time as seconds and text of each line

// or

const trackId = LyricsManager.getTrackId({
    /* Each of those options is optional but atleast one is required excluded length */
    track: "the old me", // Song name
    artist: "Henry Moodie", // Song artist
    album: "good old days", // Song album
    length: 175000, // Song duration, in ms
})

LyricsManager.getLyrics({
    trackId: trackId
}).then(data => {
    console.log(data)
})
```
# @stef-0012/synclyrics (SyncLyrics)

SyncLyrics allows you to get the plain, line synced and word synced lyrics of any song avaible on [Musixmatch](https://musixmatch.com), [LrcLib.net](https://lrclib.net) or [Netease](https://music.163.com).

**Installation**: `npm i @stef-0012/synclyrics`.

![NPM Version](https://img.shields.io/npm/v/%40stef-0012%2Fsynclyrics?style=flat&labelColor=%23CC3534)

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

# Example Output

```js
{
    album: "in all of my lonely nights", // this is the album given as input
    artist: "Henry Moodie", // this is the artist given as input
    track: "drunk text", // this is the track given as input
    cached: false, // Whetever the song has been retrieved from cache to the API
    trackId: "ZHJ1bmsgdGV4dC1IZW5yeSBNb29kaWUtaW4gYWxsIG9mIG15IGxvbmVseSBuaWdodHM=", // base64 encoded string composed by artist, track and album
    lyrics: {
        plain: {
            source: "Musixmatch",
            lyrics: "Fifth of November, when I walked you home\nThat's when I nearly said it, but then said, \"Forget it,\" and froze\n ..... (rest of the lyrics)"
        },
        lineSynced: {
            source: "Musixmatch",
            lyrics: "[00:00.14] Fifth of November, when I walked you home\n[00:08.06] That's when I nearly said it, but then said, \"Forget it,\" and froze\n ..... (rest of the lyrics)",
            parse: [Function: bound parseLyrics] // see #Example Parse Output
        },
        wordSynced: {
            source: "Musixmatch",
            lyrics: [
                {
                    end: 5.338,
                    lyric: "Fifth of November, when I walked you home",
                    start: 0.14,
                    syncedLyric: [
                        {
                            character: "Fifth",
                            time: 0
                        },
                        {
                            character: " ",
                            time: 0.836
                        },
                        {
                            character: "of",
                            time: 1.0008
                        },
                        {
                            character: " ",
                            time: 1.167
                        },
                        {
                            character: "November,",
                            time: 1.209
                        },
                        {
                            character: " ",
                            time: 3.448
                        },
                        {
                            character: "when",
                            time: 3.539
                        },
                        {
                            character: " ",
                            time: 3.83
                        },
                        {
                            character: "I",
                            time: 3.995
                        },
                        {
                            character: " ",
                            time: 4.112
                        },
                        {
                            character: "walked",
                            time: 4.21
                        },
                        {
                            character: " ",
                            time: 4.659
                        },
                        {
                            character: "you",
                            time: 4.708
                        },
                        {
                            character: " ",
                            time: 4.859
                        },
                        {
                            character: "home",
                            time: 4.974
                        }
                    ]
                },
                {
                    end: 13.156,
                    lyric: "That's when I nearly said it, but then said, \"Forget it,\" and froze",
                    start: 8.06,
                    syncedLyric: [
                        {
                            character: "That's",
                            time: 0
                        },
                        {
                            character: " ",
                            time: 0.489
                        },
                        {
                            character: "when",
                            time: 0.522
                        },
                        {
                            character: " ",
                            time: 0.763
                        },
                        {
                            character: "I",
                            time: 0.8129
                        },
                        {
                            character: " ",
                            time: 0.854
                        },
                        {
                            character: "nearly",
                            time: 0.912
                        },
                        {
                            character: " ",
                            time: 1.286
                        },
                        {
                            character: "said",
                            time: 1.319
                        },
                        {
                            character: " ",
                            time: 1.459
                        },
                        {
                            character: "it,",
                            time: 1.534
                        },
                        {
                            character: " ",
                            time: 1.717
                        },
                        {
                            character: "but",
                            time: 1.775
                        },
                        {
                            character: " ",
                            time: 2.106
                        },
                        {
                            character: "then",
                            time: 2.488
                        },
                        {
                            character: " ",
                            time: 2.754
                        },
                        {
                            character: "said,",
                            time: 2.803
                        },
                        {
                            character: " ",
                            time: 3.118
                        },
                        {
                            character: "\"Forget",
                            time: 3.177
                        },
                        {
                            character: " ",
                            time: 3.525
                        },
                        {
                            character: "it,\"",
                            time: 4.189
                        },
                        {
                            character: " ",
                            time: 4.413
                        },
                        {
                            character: "and",
                            time: 4.5199
                        },
                        {
                            character: " ",
                            time: 4.604
                        },
                        {
                            character: "froze",
                            time: 4.85
                        }
                    ]
                },
                // ..... (rest of the lyrics)
            ]
        }
    }
}
```

# Example Parse Output

```js
[
    {
        time: 0.14,
        text: 'Fifth of November, when I walked you home'
    },
    {
        time: 8.06,
        text: `That's when I nearly said it, but then said, "Forget it," and froze`
    },
    {
        time: 15.55,
        text: "Do you remember? You probably don't"
    },
    {
        time: 23.44,
        text: "'Cause the sparks in the sky took a hold of your eyes while we spoke"
    },
    // ..... (rest of the lyrics)
]
```
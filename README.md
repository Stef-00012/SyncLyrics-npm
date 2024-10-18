# @stef-0012/synclyrics (SyncLyrics)

> This package is a convertion to npm of [Stef-00012/SyncLyrics](https://github.com/Stef-00012/SyncLyrics).

SyncLyrics allows you to get the synced lyrics of any song avaible on [Musixmatch](https://musixmatch.com), [LrcLib.net](https://lrclib.net) or [Netease](https://music.xianqiao.wang).

**Installation**: `npm i @stef-0012/synclyrics`.

# Usage

```js
const { SyncLyrics } = require("@stef-0012/synclyrics");

const LyricsManager = new SyncLyrics({
    logLevel: 'none',
    instrumentalLyricsIndicator: "",
    sources: ["musixmatch", "lrclib", "netease"]
})

LyricsManager.getLyrics({
    track: "the old me",
    artist: "Henry Moodie",
    album: "good old days"
})
```

`logLevel` can be one of `none` | `info` | `warn` | `warn` | `error` | `debug`.<br />
`instrumentalLyricsIndicator` can be any `string`.<br />
`sources` has to be an array (`Array<"musixmatch" | "lrclib" | "netease">`).

When no lyrics are avaible, they are `null`.
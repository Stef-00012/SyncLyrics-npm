const { SyncLyrics } = require("../dist/index.js");

const LyricsManager = new SyncLyrics({
    logLevel: "debug"
});

(async () => {
	const data = await LyricsManager.getLyrics({
		track: "the old me",
		artist: "Henry Moodie",
		album: "good old days",
		length: 175000,
	});

	console.log(data.lyrics);

	console.log(data.parse());
})();

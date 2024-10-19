const { SyncLyrics } = require("../dist/index.js");

(async () => {
	const LyricsManager = new SyncLyrics();

	const data = await LyricsManager.getLyrics({
		track: "the old me",
		artist: "Henry Moodie",
	});

	console.log(data);
	console.log(data.lyrics);
	console.log(data.parse());
})();

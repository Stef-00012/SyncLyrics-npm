const { SyncLyrics } = require("../dist/index.js");

(async () => {
	let mxmToken;

	const LyricsManager = new SyncLyrics({
		logLevel: "debug",
		saveMusixmatchToken: (tokenData) => {
			mxmToken = tokenData;
		},
		getMusixmatchToken: () => {
			return mxmToken;
		},
	});

	const data = await LyricsManager.getLyrics({
		track: "the old me",
		artist: "Henry Moodie",
		album: "good old days",
		length: 175000,
	});

	console.log(data);
	console.log(data.lyrics);
	console.log(data.parse());
})();

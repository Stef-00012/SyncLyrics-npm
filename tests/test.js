const { SyncLyrics } = require("../dist/index.min.js");
const { describe, it } = require("node:test");

describe("Invalid methods", () => {
	const LyricsManager = new SyncLyrics();

	it("Should error because the .getLyrics() method has no metadata", async ({
		assert,
	}) => {
		assert.rejects(async () => {
			await LyricsManager.getLyrics();
		}, new Error(
			"SyncLyrics (getlyrics): At least one of track, artist, album or trackId must be present",
		));
	});

	it("Should error because the .getLyrics() method metadata has no track, album or artist", async ({
		assert,
	}) => {
		assert.rejects(async () => {
			await LyricsManager.getLyrics({
				length: 175000,
			});
		}, new Error(
			"SyncLyrics (getlyrics): At least one of track, artist, album or trackId must be present",
		));
	});

	it("Should error because the .setLogLevel() method has an invalid log level", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setLogLevel("test");
		}, Error);
	});

	it("Should error because the .setInstrumentalLyricsIndicator() method is not a string", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setInstrumentalLyricsIndicator(() => {});
		}, new Error("SyncLyrics: instrumentalLyricsIndicator must be a string"));
	});

	it("Should error because the .setSources() method is not an array", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setSources("test");
		}, new Error(
			'SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"',
		));
	});

	it("Should error because the .setSources() method is an empty array", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setSources([]);
		}, new Error(
			'SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"',
		));
	});

	it("Should error because the .setCache() method does not have .get(), .set() and .has() methods", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setCache({});
		}, new Error("SyncLyrics: cache must have .get, .set and .has methods"));
	});

	it("Should error because the .setSaveMusixmatchToken() method is not a function", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setSaveMusixmatchToken({});
		}, new Error("SyncLyrics: saveMusixmatchToken must be a function"));
	});

	it("Should error because the .setGetMusixmatchToken() method is not a function", async ({
		assert,
	}) => {
		assert.throws(() => {
			LyricsManager.setGetMusixmatchToken({});
		}, new Error("SyncLyrics: getMusixmatchToken must be a function"));
	});
});

describe("Valid methods", () => {
	it("Should return data with debug logs and custom musixmatch token handling", async ({
		assert,
	}) => {
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
			track: "right person, wrong time",
			artist: "Henry Moodie",
			album: "good old days",
			length: 175000,
		});

		assert.ok(data);
	});

	it("Should return data with all default values", async ({ assert }) => {
		const LyricsManager = new SyncLyrics();

		const data = await LyricsManager.getLyrics({
			track: "still dancing",
			artist: "Henry Moodie",
		});

		assert.ok(data);
	});
});

describe("Get track ID", () => {
	const LyricsManager = new SyncLyrics();

	it("Match [right person, wrong time]", ({ assert }) => {
		const trackId = LyricsManager.getTrackId({
			track: "right person, wrong time",
			artist: "Henry Moodie",
			album: "good old days",
			length: 175000,
		});

		assert.strictEqual(
			trackId,
			"cmlnaHQgcGVyc29uLCB3cm9uZyB0aW1lLUhlbnJ5IE1vb2RpZS1nb29kIG9sZCBkYXlz",
		);
	});

	it("Match [still dancing]", ({ assert }) => {
		const trackId = LyricsManager.getTrackId({
			track: "still dancing",
			artist: "Henry Moodie",
		});

		assert.strictEqual(trackId, "c3RpbGwgZGFuY2luZy1IZW5yeSBNb29kaWUt");
	});

	it("Not match (partially removed ID) [right person, wrong time]", ({
		assert,
	}) => {
		const trackId = LyricsManager.getTrackId({
			track: "right person, wrong time",
			artist: "Henry Moodie",
			album: "good old days",
			length: 175000,
		});

		assert.notEqual(
			trackId,
			"cmlnaHQgcGVyc29uLCB3cm9uZyB0aW1lLUhlbnJ5IE1vb2RpZS1nb29kIG9sZ",
		);
	});

	it("Not match (partially removed ID) [still dancing]", ({ assert }) => {
		const trackId = LyricsManager.getTrackId({
			track: "still dancing",
			artist: "Henry Moodie",
		});

		assert.notEqual(trackId, "c3RpbGwgZGFuY2luZy1IZW5yeSBNb2");
	});
});

describe("Cache [default method]", () => {
	const LyricsManager = new SyncLyrics();

	it("Should not be cached [the old me]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "the old me",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should not be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should be cached [the old me]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "the old me",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should not be cached [good old days] - skip cache check", async ({
		assert,
	}) => {
		const data = await LyricsManager.getLyrics(
			{
				track: "good old days",
				artist: "Henry Moodie",
			},
			true,
		);

		assert.strictEqual(data.cached, false);
	});

	it("Should be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should not be cached [good old days] - reste cache with .setCache()", async ({
		assert,
	}) => {
		LyricsManager.setCache();

		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});
});

describe("Cache [custom method]", () => {
	const LyricsManager = new SyncLyrics({
		cache: new Map(),
	});

	it("Should not be cached [the old me]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "the old me",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should not be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should be cached [the old me]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "the old me",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should not be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics(
			{
				track: "good old days",
				artist: "Henry Moodie",
			},
			true,
		);

		assert.strictEqual(data.cached, false);
	});
});

describe("Cache with ID search", () => {
	const LyricsManager = new SyncLyrics();

	it("Should not be cached [right person, wrong time]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			trackId:
				"cmlnaHQgcGVyc29uLCB3cm9uZyB0aW1lLUhlbnJ5IE1vb2RpZS1nb29kIG9sZCBkYXlz",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should not be cached [still dancing]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			trackId: "c3RpbGwgZGFuY2luZy1IZW5yeSBNb29kaWUt",
		});

		assert.strictEqual(data.cached, false);
	});

	it("Should be cached [right person, wrong time]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			trackId:
				"cmlnaHQgcGVyc29uLCB3cm9uZyB0aW1lLUhlbnJ5IE1vb2RpZS1nb29kIG9sZCBkYXlz",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should be cached [still dancing]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			trackId: "c3RpbGwgZGFuY2luZy1IZW5yeSBNb29kaWUt",
		});

		assert.strictEqual(data.cached, true);
	});

	it("Should not be cached [still dancing]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics(
			{
				trackId: "c3RpbGwgZGFuY2luZy1IZW5yeSBNb29kaWUt",
			},
			true,
		);

		assert.strictEqual(data.cached, false);
	});
});

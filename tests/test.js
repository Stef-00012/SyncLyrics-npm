const { SyncLyrics } = require("../dist/index.js");
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

	it("Should not be cached [good old days]", async ({ assert }) => {
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		}, true);

		assert.strictEqual(data.cached, false);
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
		const data = await LyricsManager.getLyrics({
			track: "good old days",
			artist: "Henry Moodie",
		}, true);

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
		const data = await LyricsManager.getLyrics({
			trackId: "c3RpbGwgZGFuY2luZy1IZW5yeSBNb29kaWUt",
		}, true);

		assert.strictEqual(data.cached, false);
	});
});

import { promisify } from "util";

const sleep = promisify(setTimeout);

/**
 * Avaible sources:
 * - {@link !Musixmatch Musixmatch}
 * - {@link !LrcLib.net LrcLib.net}
 * - {@link !Netease Netease}
 * @public
 */
export type Sources = Array<"musixmatch" | "lrclib" | "netease">;
export type LogLevel = "none" | "info" | "warn" | "error" | "debug";
export type LyricType = Array<"plain" | "lineSynced" | "wordSynced">;

const logLevels = {
	debug: 4,
	error: 3,
	warn: 2,
	info: 1,
	none: 0,
};

/**
 * {@link !Musixmatch Musixmatch} token data
 * @interface
 * @property usertoken {@link !Musixmatch Musixmatch}'s usertoken
 * @property cookies Cookies used for the {@link !Musixmatch Musixmatch}'s API request
 * @property expiresAt When the {@link !Musixmatch Musixmatch}'s {@link TokenData#usertoken usertoken} expires
 * @private
 */
export interface TokenData {
	cookies: string | undefined;
	usertoken: string;
	expiresAt: number;
}

/**
 * Song's metadata
 * @interface
 * @property track Song's name
 * @property artist Song's artist(s)
 * @property album Song's album
 * @property length Song's duration (in ms)
 * @property trackId Song's ID (returned by {@link SyncLyrics#getTrackId getTrackId})
 * @property lyricsType An array of {@link LyricType lyric types} to fetch
 * @public
 */
export interface Metadata {
	track?: string;
	album?: string;
	length?: number;
	artist?: string;
	trackId?: string;
	lyricsType?: LyricType;
}

/**
 * Any method that can store data and has .set(), .get() and .has() functions
 * @interface
 * @property set Function used to set the {@link Lyrics song's data} to the cache
 * @property get Function used to get the {@link Lyrics song's data} to the cache
 * @property has Function to check if the cache has the {@link Lyrics song's data}
 * @public
 */
export interface Cache<K, V> {
	get(key: K): V | undefined | null;
	set(key: K, value: V): void;
	has(key: K): boolean;
	[key: string]: any;
}

/**
 * @interface
 * @property logLevel The level of the logging
 * @property instrumentalLyricsIndicator The character to use for instrumental lyrics (more than 3 seconds of music without any voice)
 * @property sources Array of sources to use, in the order they have to be fetched
 * @property cache Any method that can store data and has .set(), .get() and .has() functions
 * @property saveMusixmatchToken Function used to save the {@link !Musixmatch Musixmatch} token (required to fetch the lyrics data from {@link !Musixmatch Musixmatch})
 * @property getMusixmatchToken Function used to fetch the {@link !Musixmatch Musixmatch} token (required to fetch the lyrics data from {@link !Musixmatch Musixmatch})
 * @public
 */
export interface Data {
	logLevel?: LogLevel;
	instrumentalLyricsIndicator?: string;
	sources?: Sources;
	cache?: Cache<
		string | null | undefined,
		CacheLyrics | null | undefined | null
	>;
	saveMusixmatchToken?: (tokenData: TokenData) => void;
	getMusixmatchToken?: () => TokenData | null | undefined;
}

/**
 * @interface
 * @property time When the lyric starts
 * @property text Lyric's text
 * @public
 */
export interface FormattedLyric {
	time: number;
	text: string;
}

/**
 * @interface
 * @property parse Function to parse the returned lyrics into {@link FormattedLyric}
 * @property source Lyrics source
 * @property lyrics Line synced lyrics in the {@link !LRC_file_format LRC} format
 * @public
 */
export interface LineSyncedLyricsData {
	parse: (lyrics?: string | null | undefined) => FormattedLyric[] | null;
	source: string | null | undefined;
	lyrics: string | null | undefined;
}

/**
 * @interface
 * @property source Lyrics source
 * @property lyrics Lyrics as plain text
 * @public
 */
export interface PlainLyricsData {
	source: string | null | undefined;
	lyrics: string | null | undefined;
}

/**
 * @interface
 * @property character The character of the timeframe that starts at the specified {@link WordSyncedLyricsLine#time time}
 * @property time When the character timeframe starts
 * @public
 */
export interface WordSyncedLyricsLine {
	character: string;
	time: number;
}

/**
 * @interface
 * @property end When the lyric's line ends
 * @property start When the lyric's line starts
 * @property lyric The lyric complete text
 * @property syncedLyric The lyric synced by characters
 * @public
 */
export interface WordSyncedLyrics {
	end: number;
	start: number;
	lyric: string;
	syncedLyric: Array<WordSyncedLyricsLine>;
}

/**
 * @interface
 * @property source Lyrics source
 * @property lyrics {@link WordSyncedLyrics Word synced lyrics}
 * @public
 */
export interface WordSyncedLyricsData {
	source: string | null | undefined;
	lyrics: Array<WordSyncedLyrics> | null | undefined;
}

/**
 * @interface
 * @property lineSynced {@link LineSyncedLyricsData Line synced lyrics}
 * @property plain {@link PlainLyricsData Plain lyrics}
 * @property wordSynced {@link WordSyncedLyricsData Word synced lyrics}
 * @public
 */
export interface Lyrics {
	wordSynced: WordSyncedLyricsData;
	lineSynced: LineSyncedLyricsData;
	plain: PlainLyricsData;
}

/**
 * @interface
 * @property source Lyrics source
 * @property lyrics Line synced lyrics in the {@link !LRC_file_format LRC} format
 * @private
 */
export interface CacheLineSyncedLyricsData {
	source: string | null | undefined;
	lyrics: string | null | undefined;
}

/**
 * @interface
 * @property lineSynced {@link CacheLineSyncedLyricsData Line synced lyrics}
 * @property plain {@link PlainLyricsData Plain lyrics}
 * @property wordSynced {@link WordSyncedLyricsData Word synced lyrics}
 * @private
 */
export interface CacheLyrics {
	wordSynced: WordSyncedLyricsData;
	lineSynced: CacheLineSyncedLyricsData;
	plain: PlainLyricsData;
}

/**
 * @interface
 * @property trackId Fetched track's ID
 * @property lyrics Object with track's avaible {@link Lyrics lyrics}
 * @property track Song's name
 * @property artist Song's artist(s)
 * @property album Song's album
 * @property cached Whetever the song data was retrieved from the cache rather than the APIs
 * @public
 */
export interface LyricsOutput {
	artist: string | undefined;
	track: string | undefined;
	album: string | undefined;
	trackId: string;
	cached: boolean;
	lyrics: Lyrics;
}

/**
 * @interface
 * @property commonTrackId {@link !Musixmatch Musixmatch}'s commontrack_id
 * @property trackId {@link !Musixmatch Musixmatch}'s track_id
 * @property hasLyrics Whetever the {@link !Musixmatch Musixmatch}'s catalogue has the song's plain lyrics
 * @property hasLineSyncedLyrics Whetever the {@link !Musixmatch Musixmatch}'s catalogue has the song's line synced lyrics
 * @property hasWordSyncedLyrics Whetever the {@link !Musixmatch Musixmatch}'s catalogue has the song's word synced lyrics
 * @private
 */
export interface MusixmatchSearchResult {
	hasLineSyncedLyrics: boolean;
	hasWordSyncedLyrics: boolean;
	commonTrackId: string;
	hasLyrics: boolean;
	trackId: string;
}

/**
 * @interface
 * @property plain Track's plain lyrics
 * @property lineSynced Track's line synced lyrics
 * @property wordSynced Track's word synced lyrics
 * @private
 */
export interface MusixmatchLyricsFetchResult {
	wordSynced: Array<WordSyncedLyrics> | null;
	lineSynced: string | null;
	plain: string | null;
}

/**
 * @interface
 * @property source Musixmatch
 * @property plain Plain lyrics if avaible
 * @property lineSynced Line synced lyrics if avaible
 * @property wordSynced Line synced lyrics if avaible
 * @private
 */
export interface MusixmatchFetchResult {
	wordSynced?: Array<WordSyncedLyrics> | null;
	lineSynced?: string | null;
	plain?: string | null;
	source: "Musixmatch";
}

/**
 * @interface
 * @property source lrclib.net
 * @property plain Plain lyrics if avaible
 * @property lineSynced Line synced lyrics if avaible
 * @property wordSynced Always null as {@link !LrcLib.net lrclib.net} does not support word synced lyrics
 * @private
 */
export interface LrcLibFetchResult {
	lineSynced: string | null;
	plain: string | null;
	source: "lrclib.net";
	wordSynced: null;
}

/**
 * @interface
 * @property source Netease
 * @property plain Always null as {@link !Netease Netease} does not support word synced lyrics
 * @property lineSynced Line synced lyrics if avaible
 * @property wordSynced Always null as {@link !Netease Netease} does not support word synced lyrics
 * @private
 */
export interface NeteaseFetchResult {
	lineSynced: string | null;
	source: "Netease";
	wordSynced: null;
	plain: null;
}

/**
 * @property logLevel The level of the logging
 * @property instrumentalLyricsIndicator The character to use for instrumental lyrics (more than 3 seconds of music without any voice)
 * @property sources Array of sources to use, in the order they have to be fetched
 * @property cache Any method that can store data and has .set(), .get() and .has() functions
 * @property saveMusixmatchToken Function used to save the {@link !Musixmatch Musixmatch} token (required to fetch the lyrics data from {@link !Musixmatch Musixmatch})
 * @property getMusixmatchToken Function used to fetch the {@link !Musixmatch Musixmatch} token (required to fetch the lyrics data from {@link !Musixmatch Musixmatch})
 * @property _trackId Used for the logging within the different functions and to fetch the track's data from the {@link SyncLyrics#cache cache} if avaible
 * @property lyrics The fetched lyrics, used for the {@link LineSyncedLyricsData#parse .parse()} method in the {@link LineSyncedLyricsData}
 */
export class SyncLyrics {
	public logLevel: LogLevel;
	public instrumentalLyricsIndicator: string;
	public sources: Sources;
	public cache: Cache<
		string | null | undefined,
		CacheLyrics | null | undefined | null
	>;
	public saveMusixmatchToken:
		| null
		| undefined
		| ((tokenData: TokenData) => void | Promise<void>);
	public getMusixmatchToken:
		| null
		| undefined
		| (() =>
				| TokenData
				| Promise<TokenData | null | undefined>
				| null
				| undefined);

	private lyrics: string | null | undefined;
	private _trackId: string | null;

	/**
	 * @param data The lyrics manager configuration
	 * @example
	 * ```js
	 * let mxmToken;
	 *
	 * const LyricsManager = new SyncLyrics({
	 *     cache: new Map(), // Anything that can store data and has a .set(K, V), .get(K) and .has(K) values
	 *     logLevel: 'none', // One of "none" | "info" | "warn" | "error" | "debug"
	 *     instrumentalLyricsIndicator: "", // Any string
	 *     sources: ["musixmatch", "lrclib", "netease"], // An array with atleast one of those sources
	 *     saveMusixmatchToken: (tokenData) => { // A custom function to save the Musixmatch token, otherwise it'll skip Musixmatch fetch
	 *         mxmToken = tokenData;
	 *     },
	 *     getMusixmatchToken: () => { // A custom function to save the Musixmatch token, otherwise it'll skip Musixmatch fetch
	 *         return mxmToken;
	 *     },
	 * })
	 * ```
	 */
	constructor(data?: Data) {
		if (
			typeof data?.logLevel === "string" &&
			!Object.keys(logLevels).includes(data.logLevel)
		)
			throw new Error(
				`SyncLyrics: logLevel must be one of "${Object.keys(logLevels).join('" | "')}"`,
			);
		if (
			data?.instrumentalLyricsIndicator &&
			typeof data.instrumentalLyricsIndicator !== "string"
		)
			throw new Error(
				"SyncLyrics: instrumentalLyricsIndicator must be a string",
			);
		if (
			data?.sources &&
			(!Array.isArray(data.sources) || data.sources.length <= 0)
		)
			throw new Error(
				'SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"',
			);
		if (
			data?.cache &&
			(typeof data.cache.get !== "function" ||
				typeof data.cache.set !== "function" ||
				typeof data.cache.has !== "function")
		)
			throw new Error(
				"SyncLyrics: cache must have .get, .set and .has methods",
			);
		if (
			data?.saveMusixmatchToken &&
			typeof data.saveMusixmatchToken !== "function"
		)
			throw new Error("SyncLyrics: saveMusixmatchToken must be a function");
		if (
			data?.getMusixmatchToken &&
			typeof data.getMusixmatchToken !== "function"
		)
			throw new Error("SyncLyrics: getMusixmatchToken must be a function");

		this.logLevel = data?.logLevel || "none";
		this.instrumentalLyricsIndicator = data?.instrumentalLyricsIndicator || "";
		this.sources = data?.sources || ["musixmatch", "lrclib", "netease"];
		this.cache = data?.cache || new Map();
		this.saveMusixmatchToken = data?.saveMusixmatchToken;
		this.getMusixmatchToken = data?.getMusixmatchToken;

		this.lyrics = null;
		this._trackId = null;

		this._fetchLineSyncedLyricsMusixmatch =
			this._fetchLineSyncedLyricsMusixmatch.bind(this);
		this._fetchWordSyncedLyricsMusixmatch =
			this._fetchWordSyncedLyricsMusixmatch.bind(this);
		this._fetchPlainLyricsMusixmatch =
			this._fetchPlainLyricsMusixmatch.bind(this);
		this._searchLyricsMusixmatch = this._searchLyricsMusixmatch.bind(this);
		this._fetchLyricsMusixmatch = this._fetchLyricsMusixmatch.bind(this);
		this.getMusixmatchUsertoken = this.getMusixmatchUsertoken.bind(this);
		this.fetchLyricsMusixmatch = this.fetchLyricsMusixmatch.bind(this);
		this._searchLyricsNetease = this._searchLyricsNetease.bind(this);
		this._parseNeteaseLyrics = this._parseNeteaseLyrics.bind(this);
		this._fetchLyricsNetease = this._fetchLyricsNetease.bind(this);
		this.fetchLyricsNetease = this.fetchLyricsNetease.bind(this);
		this.fetchLyricsLrclib = this.fetchLyricsLrclib.bind(this);
		this.parseLyrics = this.parseLyrics.bind(this);
		this._getLyrics = this._getLyrics.bind(this);
		this.getTrackId = this.getTrackId.bind(this);
		this.getLyrics = this.getLyrics.bind(this);
		this.debugLog = this.debugLog.bind(this);
		this.errorLog = this.errorLog.bind(this);
		this.infoLog = this.infoLog.bind(this);
		this.warnLog = this.warnLog.bind(this);
	}

	/**
	 * Gets the {@link !Musixmatch Musixmatch}'s usertoken if not returned by the {@link Data#getMusixmatchToken getMusixmatchToken()} method
	 * @param cookies {@link !Musixmatch Musixmatch}'s HTTP request cookies
	 * @returns {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 */
	private async getMusixmatchUsertoken(
		cookies?: string,
	): Promise<TokenData | null | undefined> {
		this.infoLog("Getting Musixmatch token...");

		if (!this.saveMusixmatchToken || !this.getMusixmatchToken) {
			this.infoLog("Musixmatch token functions are not avaible, skipping...");

			return null;
		}

		const tokenData: TokenData | null | undefined =
			await this.getMusixmatchToken();

		if (tokenData) return tokenData;

		this.infoLog("Fetching the token from the API...");

		const url: string =
			"https://apic-desktop.musixmatch.com/ws/1.1/token.get?user_language=en&app_id=web-desktop-app-v1.0";

		try {
			const res: Response = await fetch(url, {
				redirect: "manual",
				// @ts-ignore
				headers: {
					cookie: cookies,
				},
			});

			if (res.status === 301) {
				this.debugLog(
					"Successfully received the 'set-cookie' redirect response",
				);

				const setCookie = res.headers
					.getSetCookie()
					.map((cookie) => cookie.split(";").shift())
					// @ts-ignore
					.filter((cookie) => cookie.split("=").pop() !== "unknown")
					.join("; ");

				this.debugLog("Re-fetching with the cookies...");

				return await this.getMusixmatchUsertoken(setCookie);
			}

			if (!res.ok) {
				this.warnLog(
					`The usertoken API request failed with the status ${res.status} (${res.statusText})`,
				);

				return null;
			}

			const data = await res.json();

			if (
				data?.message?.header?.status_code === 401 &&
				data?.message?.header?.hint === "captcha"
			) {
				this.warnLog(
					"Musixmatch usertoken endpoint is being ratelimited, retrying in 10 seconds...",
				);

				await sleep(10000); // wait 10 seconds

				this.infoLog("Retrying to fetch the Musixmatch usertken...");

				return await this.getMusixmatchUsertoken(cookies);
			}

			const usertoken = data?.message?.body?.user_token;

			if (!usertoken) {
				this.infoLog("The API response did not include the usertoken");

				return null;
			}

			const json: TokenData = {
				cookies,
				usertoken,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000).getTime(), // 10 minutes
			};

			await this.saveMusixmatchToken(json);

			this.infoLog("Successfully fetched the usertoken");

			return json;
		} catch (e) {}
	}

	/**
	 * Searchs the {@link !Musixmatch Musixmatch} catalog with the data provided in the {@link Metadata metadata}
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param tokenData The {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 * @returns If found, the {@link !Musixmatch Musixmatch}'s commontrack_id, track_id and whetever the track has lyrics, line synced lyrics or word synced lyrics
	 */
	private async _searchLyricsMusixmatch(
		metadata: Metadata,
		tokenData: TokenData,
	): Promise<MusixmatchSearchResult | null> {
		if (!metadata || !tokenData) return null;

		// @ts-ignore
		const duration = Number.parseFloat(metadata.length) / 1000;

		// @ts-ignore
		const searchParams = new URLSearchParams({
			app_id: "web-desktop-app-v1.0",
			usertoken: tokenData.usertoken,
			q_track: metadata.track || "",
			q_artist: metadata.artist || "",
			q_album: metadata.album || "",
			page_size: 20,
			page: 1,
			q_duration: duration || "",
			s_track_rating: "asc",
		});

		const url: string = `https://apic-desktop.musixmatch.com/ws/1.1/track.search?${searchParams}`;

		try {
			this.debugLog("Musixmatch search fetch URL:", url);

			const res: Response = await fetch(url, {
				// @ts-ignore
				headers: {
					cookie: tokenData.cookies,
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Search]`,
				);

				return null;
			}

			const data = await res.json();

			if (
				data?.message?.header?.status_code === 401 &&
				data?.message?.header?.hint === "captcha"
			) {
				this.warnLog(
					"The usertoken has been temporary blocked for too many requests (captcha) [Musixmatch - Search]",
				);

				return null;
			}

			this.debugLog(
				"Musixmatch search results:",
				data?.message?.body?.track_list,
			);

			if (data?.message?.body?.track_list?.length <= 0) {
				this.infoLog("No songs were found [Musixmatch - Search]");

				return null;
			}

			const track = data?.message?.body?.track_list?.find(
				(listItem: any) =>
					listItem.track.track_name?.toLowerCase() ===
						metadata.track?.toLowerCase() &&
					listItem.track.artist_name
						?.toLowerCase()
						.includes(metadata.artist?.toLowerCase()),
			);

			this.debugLog("Musixmatch search filtered track:", track);

			if (!track) {
				this.infoLog(
					"No songs were found with the current name and artist [Musixmatch - Search]",
				);

				return null;
			}

			this.debugLog(track);

			const commonTrackId = track?.track?.commontrack_id;
			const trackId = track?.track?.track_id;
			const hasLyrics = track?.track?.has_lyrics;
			const hasLineSyncedLyrics = track?.track?.has_subtitles;
			const hasWordSyncedLyrics = track?.track?.has_richsync;

			if (!hasLyrics && !hasLineSyncedLyrics && !hasWordSyncedLyrics)
				return null;

			this.debugLog("Musixmatch commontrack_id", commonTrackId);
			this.debugLog("Musixmatch track_id", trackId);

			return {
				commonTrackId,
				trackId,
				hasLyrics,
				hasLineSyncedLyrics,
				hasWordSyncedLyrics,
			};
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Musixmatch - Search]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the plain lyrics of the song from {@link !Musixmatch Musixmatch}, only if the search result specifies the song has plain lyrics
	 * @param tokenData The {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 * @param commonTrackId The {@link !Musixmatch Musixmatch} track's commontrack_id
	 * @returns The Track's {@link PlainLyricsData#lyrics Lyrics} if avaible
	 */
	private async _fetchPlainLyricsMusixmatch(
		tokenData: TokenData,
		commonTrackId: string,
	): Promise<string | null> {
		if (!tokenData || !commonTrackId) return null;

		const searchParams: URLSearchParams = new URLSearchParams({
			app_id: "web-desktop-app-v1.0",
			usertoken: tokenData.usertoken,
			commontrack_id: commonTrackId,
		});

		const url: string = `https://apic-desktop.musixmatch.com/ws/1.1/track.lyrics.get?${searchParams}`;

		try {
			this.debugLog("Musixmatch lyrics fetch URL:", url);

			const res: Response = await fetch(url, {
				// @ts-ignore
				headers: {
					cookie: tokenData.cookies,
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Lyrics]`,
				);

				return null;
			}

			const data = await res.json();

			if (
				data?.message?.header?.status_code === 401 &&
				data?.message?.header?.hint === "captcha"
			) {
				this.warnLog(
					"The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Lyrics]",
				);

				return null;
			}

			this.debugLog("Musixmatch track data:", data?.message?.body);

			const lyrics = data?.message?.body?.lyrics?.lyrics_body;

			if (!lyrics) {
				this.infoLog("Missing Lyrics [Musixmatch - Lyrics]");

				return null;
			}

			this.infoLog(
				"Successfully fetched and cached the plain lyrics [Musixmatch]",
			);

			return lyrics;
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Musixmatch - Lyrics]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the line synced lyrics of the song from {@link !Musixmatch Musixmatch}, only if the search result specifies the song has line synced lyrics
	 * @param tokenData The {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 * @param commonTrackId The {@link !Musixmatch Musixmatch} track's commontrack_id
	 * @returns The Track's {@link LineSyncedLyricsData#lyrics Lyrics} if avaible
	 */
	private async _fetchLineSyncedLyricsMusixmatch(
		tokenData: TokenData,
		commonTrackId: string,
	): Promise<string | null> {
		if (!tokenData || !commonTrackId) return null;

		const searchParams: URLSearchParams = new URLSearchParams({
			app_id: "web-desktop-app-v1.0",
			usertoken: tokenData.usertoken,
			commontrack_id: commonTrackId,
		});

		const url: string = `https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get?${searchParams}`;

		try {
			this.debugLog("Musixmatch synced lyrics fetch URL:", url);

			const res: Response = await fetch(url, {
				// @ts-ignore
				headers: {
					cookie: tokenData.cookies,
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Synced Lyrics]`,
				);

				return null;
			}

			const data = await res.json();

			if (
				data?.message?.header?.status_code === 401 &&
				data?.message?.header?.hint === "captcha"
			) {
				this.warnLog(
					"The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Synced Lyrics]",
				);

				return null;
			}

			this.debugLog("Musixmatch track data:", data?.message?.body);

			const lyrics = data?.message?.body?.subtitle?.subtitle_body;

			if (!lyrics) {
				this.infoLog("Missing Lyrics [Musixmatch - Synced Lyrics]");

				return null;
			}

			this.infoLog(
				"Successfully fetched and cached the synced lyrics [Musixmatch]",
			);

			return lyrics;
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Musixmatch - Synced Lyrics]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the line word lyrics of the song from {@link !Musixmatch Musixmatch}, only if the search result specifies the song has word synced lyrics
	 * @param tokenData The {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 * @param trackId The {@link !Musixmatch Musixmatch} track's track_id
	 * @returns The Track's {@link WordSyncedLyricsData#lyrics Lyrics} if avaible
	 */
	private async _fetchWordSyncedLyricsMusixmatch(
		tokenData: TokenData,
		trackId: string,
	): Promise<Array<WordSyncedLyrics> | null> {
		if (!tokenData || !trackId) return null;

		const searchParams: URLSearchParams = new URLSearchParams({
			app_id: "web-desktop-app-v1.0",
			usertoken: tokenData.usertoken,
			track_id: trackId,
		});

		const url: string = `https://apic-desktop.musixmatch.com/ws/1.1/track.richsync.get?${searchParams}`;

		try {
			this.debugLog("Musixmatch lyrics fetch URL:", url);

			const res: Response = await fetch(url, {
				// @ts-ignore
				headers: {
					cookie: tokenData.cookies,
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Word Synced Lyrics]`,
				);

				return null;
			}

			const data = await res.json();

			if (
				data?.message?.header?.status_code === 401 &&
				data?.message?.header?.hint === "captcha"
			) {
				this.warnLog(
					"The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Word Synced Lyrics]",
				);

				return null;
			}

			this.debugLog("Musixmatch track data:", data?.message?.body);

			let lyrics = data?.message?.body?.richsync?.richsync_body;

			if (!lyrics || lyrics.length <= 0) {
				this.infoLog("Missing Lyrics [Musixmatch - Word Synced Lyrics]");

				return null;
			}

			lyrics = JSON.parse(lyrics);

			const parsedLyrics = lyrics.map(
				(line: {
					ts: number;
					te: number;
					x: string;
					l: Array<{ c: string; o: number }>;
				}) => {
					const start = line.ts;
					const end = line.te;
					const lyric = line.x;
					const syncedLyric = line.l.map((word) => ({
						character: word.c,
						time: word.o,
					}));

					return {
						end,
						lyric,
						start,
						syncedLyric,
					};
				},
			);

			this.infoLog(
				"Successfully fetched and cached the synced lyrics [Musixmatch]",
			);

			return parsedLyrics;
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Musixmatch - Word Synced Lyrics]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the song's lyrics based on the search results
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param tokenData The {@link !Musixmatch Musixmatch}'s {@link TokenData token data}
	 * @param trackId The {@link !Musixmatch Musixmatch} track's track_id
	 * @param commonTrackId The {@link !Musixmatch Musixmatch} track's commontrack_id
	 * @param hasLyrics Whetever the search result specifies the song has plain lyrics
	 * @param hasLineSyncedLyrics Whetever the search result specifies the song has line synced lyrics
	 * @param hasWordSyncedLyrics Whetever the search result specifies the song has word synced lyrics
	 * @param lyricsType The {@link LyricType type of lyrics} to fetch
	 * @returns Plain, line synced and word synced lyrics when avaible
	 */
	private async _fetchLyricsMusixmatch(
		metadata: Metadata,
		tokenData: TokenData,
		trackId: string,
		commonTrackId: string,
		hasLyrics: boolean,
		hasLineSyncedLyrics: boolean,
		hasWordSyncedLyrics: boolean,
		lyricsType: LyricType
	): Promise<MusixmatchLyricsFetchResult | null> {
		if (
			!metadata ||
			(!commonTrackId && !trackId) ||
			!tokenData ||
			(!hasLyrics && !hasLineSyncedLyrics && !hasWordSyncedLyrics)
		)
			return null;

		const lyricsData: MusixmatchLyricsFetchResult = {
			plain: null,
			lineSynced: null,
			wordSynced: null,
		};

		if (hasLyrics && commonTrackId && lyricsType.includes("plain"))
			lyricsData.plain = await this._fetchPlainLyricsMusixmatch(
				tokenData,
				commonTrackId,
			);
		if (hasLineSyncedLyrics && commonTrackId && lyricsType.includes("lineSynced"))
			lyricsData.lineSynced = await this._fetchLineSyncedLyricsMusixmatch(
				tokenData,
				commonTrackId,
			);
		if (hasWordSyncedLyrics && commonTrackId && lyricsType.includes("wordSynced"))
			lyricsData.wordSynced = await this._fetchWordSyncedLyricsMusixmatch(
				tokenData,
				trackId,
			);

		return lyricsData;
	}

	/**
	 * Searchs the {@link !Netease Netease} catalog with the data provided in the {@link Metadata metadata}
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @returns If found, the {@link !Netease Netease} track's ID
	 */
	private async _searchLyricsNetease(
		metadata: Metadata,
	): Promise<string | null> {
		// @ts-ignore
		const searchParams: URLSearchParams = new URLSearchParams({
			limit: 10,
			type: 1,
			keywords: `${metadata.track} ${metadata.artist}`,
		});

		const url: string = `https://music.xianqiao.wang/neteaseapiv2/search?${searchParams}`;

		try {
			this.debugLog("Netease search fetch URL:", url);

			const res: Response = await fetch(url, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Netease - Search]`,
				);

				return null;
			}

			const data = await res.json();

			if (!data?.result?.songs || data?.result?.songs?.length <= 0) {
				this.infoLog("No songs were found [Netease - Search]");

				return null;
			}

			const track = data?.result?.songs?.find(
				(listItem: any) =>
					listItem.name?.toLowerCase() === metadata.track?.toLowerCase() &&
					(listItem.artists.some((artist: any) =>
						artist.name
							?.toLowerCase()
							?.includes(metadata.artist?.toLowerCase()),
					) ||
						listItem.artists.some((artist: any) =>
							artist.name
								?.toLowerCase()
								?.replace(/-/g, " ")
								?.includes(metadata.artist?.toLowerCase()?.replace(/-/g, " ")),
						)),
			);

			this.debugLog("Netease search filtered track:", track);

			if (!track) {
				this.infoLog(
					"No songs were found with the current name and artist [Netease - Search]",
				);

				return null;
			}

			const trackId = track.id;

			this.debugLog("Neteasw track ID", trackId);

			return trackId;
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Netease - Search]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the line synced lyrics from {@link !Netease Netease}
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param trackId The {@link !Netease Netease} track's ID
	 * @returns The track's line synced lyrics if avaible
	 */
	private async _fetchLyricsNetease(
		metadata: Metadata,
		trackId: string,
	): Promise<string | null> {
		if (!metadata || !trackId) return null;

		const searchParams: URLSearchParams = new URLSearchParams({
			id: trackId,
		});

		const url: string = `https://music.xianqiao.wang/neteaseapiv2/lyric?${searchParams}`;

		try {
			this.debugLog("Netease lyrics fetch URL:", url);

			const res: Response = await fetch(url, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Netease - Lyrics]`,
				);

				return null;
			}

			const data = await res.json();

			this.debugLog("Netease track data:", data);

			let lyrics = data?.lrc?.lyric;

			if (!lyrics) {
				this.infoLog("Missing Lyrics [Netease - Lyrics]");

				return null;
			}

			lyrics = this._parseNeteaseLyrics(lyrics);

			this.infoLog(
				"Successfully fetched and cached the synced lyrics [Netease]",
			);

			return lyrics;
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [Netease - Lyrics]",
				e,
			);

			return null;
		}
	}

	/**
	 * Removes useless metadata returned by {@link !Netease Netease}
	 * @param slyrics Lyrics returned by {@link !Netease Netease}
	 * @returns {@link !Netease Netease} returned lyrics without extra metadata
	 */
	private _parseNeteaseLyrics(slyrics: string): string {
		const lines = slyrics.split(/\r?\n/).map((line) => line.trim());
		const lyrics: Array<string> = [];

		const creditInfo: Array<string> = [
			"\\s?作?\\s*词|\\s?作?\\s*曲|\\s?编\\s*曲?|\\s?监\\s*制?",
			".*编写|.*和音|.*和声|.*合声|.*提琴|.*录|.*工程|.*工作室|.*设计|.*剪辑|.*制作|.*发行|.*出品|.*后期|.*混音|.*缩混",
			"原唱|翻唱|题字|文案|海报|古筝|二胡|钢琴|吉他|贝斯|笛子|鼓|弦乐| 人声 ",
			"lrc|publish|vocal|guitar|program|produce|write|mix",
		];
		const creditInfoRegExp: RegExp = new RegExp(
			`^(${creditInfo.join("|")}).*(:|：)`,
			"i",
		);

		for (let i = 0; i < lines.length; i++) {
			const line: string = lines[i];
			const matchResult = line.match(/(\[.*?\])|([^\[\]]+)/g);

			if (!matchResult || matchResult.length === 1) {
				continue;
			}

			let textIndex = -1;
			for (let j = 0; j < matchResult.length; j++) {
				if (!matchResult[j].endsWith("]")) {
					textIndex = j;
					break;
				}
			}

			let text = "";

			if (textIndex > -1) {
				text = matchResult.splice(textIndex, 1)[0];
				text = text.charAt(0).toUpperCase() + normalize(text.slice(1));
			}

			const time = matchResult[0];

			if (!creditInfoRegExp.test(text)) {
				lyrics.push(`${time} ${text || ""}`);
			}
		}

		return lyrics.join("\n");
	}

	/**
	 * Fetches the plain and line synced lyrics from the {@link !LrcLib.net lrclib.net}'s catalogue
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param lyricsType The {@link LyricType type of lyrics} to fetch
	 * @returns Plain and line synced lyrics from {@link !LrcLib.net lrclib.net} when avaible
	 */
	private async fetchLyricsLrclib(
		metadata: Metadata,
		lyricsType: LyricType
	): Promise<LrcLibFetchResult | null> {
		if (!metadata) return null;
		if (!lyricsType.includes("plain") && !lyricsType.includes("lineSynced")) return null;

		this.infoLog(
			`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [LRCLIB]`,
		);

		// @ts-ignore
		const searchParams = new URLSearchParams({
			track_name: metadata.track,
			artist_name: metadata.artist,
			album_name: metadata.album,
			q: metadata.track,
		});

		const url: string = `https://lrclib.net/api/search?${searchParams}`;

		try {
			const res: Response = await fetch(url, {
				headers: {
					"Lrclib-Client":
						"SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
					"User-Agent": "SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
				},
			});

			if (!res.ok) {
				this.warnLog(
					`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [LRCLIB]`,
				);

				return null;
			}

			const data = await res.json();

			this.debugLog("lrclib.net results:", data);

			const match = data.find(
				(d: any) =>
					d.artistName
						?.toLowerCase()
						.includes(metadata.artist?.toLowerCase()) &&
					d.trackName?.toLowerCase() === metadata.track?.toLowerCase(),
			);

			this.debugLog("lrclib filtered track:", match);

			if (
				!match ||
				((!match.syncedLyrics || match.syncedLyrics?.length <= 0) &&
					(!match.plainLyrics || match.plainLyrics?.length <= 0))
			) {
				this.infoLog("The fetched song does not have lyrics [LRCLIB]");

				return null;
			}

			this.infoLog("Successfully fetched and cached the lyrics [LRCLIB]");

			return {
				source: "lrclib.net",
				plain: match?.plainLyrics,
				lineSynced: match?.syncedLyrics,
				wordSynced: null,
			};
		} catch (e) {
			this.errorLog(
				"Something went wrong while fetching the lyrics [LRCLIB]",
				e,
			);

			return null;
		}
	}

	/**
	 * Fetches the plain, line synced and word synced lyrics from the {@link !Musixmatch Musixmatch}'s catalogue
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param lyricsType The {@link LyricType type of lyrics} to fetch
	 * @returns Plain, line synced and word synced lyrics from {@link !Musixmatch Musixmatch} when avaible
	 */
	private async fetchLyricsMusixmatch(
		metadata: Metadata,
		lyricsType: LyricType
	): Promise<MusixmatchFetchResult | null> {
		if (!metadata) return null;

		const tokenData = await this.getMusixmatchUsertoken();

		this.debugLog("Musixmatch token data:", tokenData);

		if (!tokenData) return null;

		this.infoLog(
			`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [Musixmatch]`,
		);

		const trackData = await this._searchLyricsMusixmatch(metadata, tokenData);

		if (
			!trackData ||
			(!trackData.hasLyrics &&
				!trackData.hasLineSyncedLyrics &&
				!trackData.hasWordSyncedLyrics) ||
			(!trackData.commonTrackId && !trackData.trackId)
		) {
			this.infoLog(
				"Missing both commontrack_id and track_id [Musixmatch - Search]",
			);

			return null;
		}

		const lyrics = await this._fetchLyricsMusixmatch(
			metadata,
			tokenData,
			trackData.trackId,
			trackData.commonTrackId,
			trackData.hasLyrics,
			trackData.hasLineSyncedLyrics,
			trackData.hasWordSyncedLyrics,
			lyricsType
		);

		return {
			source: "Musixmatch",
			...lyrics,
		};
	}

	/**
	 * Fetches the line synced lyrics from the {@link !Netease Netease}'s catalogue
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param lyricsType The {@link LyricType type of lyrics} to fetch
	 * @returns Line synced lyrics from {@link !Netease Netease} when avaible
	 */
	private async fetchLyricsNetease(
		metadata: Metadata,
		lyricsType: LyricType
	): Promise<NeteaseFetchResult | null> {
		if (!metadata) return null;
		if (!lyricsType.includes("lineSynced")) return null;

		const trackId = await this._searchLyricsNetease(metadata);

		if (!trackId) {
			this.infoLog("Missing track ID [Netease - Search]");

			return null;
		}

		const lyrics = await this._fetchLyricsNetease(metadata, trackId);

		return {
			source: "Netease",
			lineSynced: lyrics,
			plain: null,
			wordSynced: null,
		};
	}

	/**
	 * Fetches the lyrics from the specified {@link Data#sources sources}
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album} or {@link Metadata#length duration}
	 * @param lyricsType The {@link LyricType type of lyrics} to fetch
	 * @returns The lyrics fetched the avaible sources
	 */
	private async _getLyrics(metadata: Metadata, lyricsType: LyricType): Promise<CacheLyrics> {
		const sourcesTypes = {
			musixmatch: ["plain", "line", "word"],
			lrclib: ["plain", "line"],
			netease: ["line"],
		};

		const avaibleSources = {
			musixmatch: this.fetchLyricsMusixmatch,
			lrclib: this.fetchLyricsLrclib,
			netease: this.fetchLyricsNetease,
		};

		let sources: Sources = this.sources || ["musixmatch", "lrclib", "netease"];

		const lyricsData: {
			plain: {
				source: string | null | undefined;
				lyrics: string | null | undefined;
			};
			lineSynced: {
				source: string | null | undefined;
				lyrics: string | null | undefined;
			};
			wordSynced: {
				source: string | null | undefined;
				lyrics:
					| Array<{
							end: number;
							start: number;
							lyric: string;
							syncedLyric: Array<{ character: string; time: number }>;
					  }>
					| null
					| undefined;
			};
		} = {
			plain: {
				source: null,
				lyrics: null,
			},
			lineSynced: {
				source: null,
				lyrics: null,
			},
			wordSynced: {
				source: null,
				lyrics: null,
			},
		};

		if (
			sources.every((source) => !Object.keys(avaibleSources).includes(source))
		)
			sources = ["musixmatch", "lrclib", "netease"];

		sourcesLoop: for (const source of sources) {
			this.infoLog(`Trying to fetch the lyrics from the source "${source}"`);

			if (
				source === "musixmatch" &&
				(!this.saveMusixmatchToken || !this.getMusixmatchToken)
			) {
				this.infoLog("Musixmatch token functions are not avaible, skipping...");

				continue;
			}

			let sourceSkip = 0;

			const avaibleTypes = sourcesTypes[source];

			for (const type of avaibleTypes) {
				if (type === "plain" && (lyricsData.plain.lyrics || !lyricsType.includes("plain"))) sourceSkip++;
				if (type === "line" && (lyricsData.lineSynced.lyrics || !lyricsType.includes("lineSynced"))) sourceSkip++;
				if (type === "word" && (lyricsData.wordSynced.lyrics || !lyricsType.includes("wordSynced"))) sourceSkip++;

				if (sourceSkip >= avaibleTypes.length) continue sourcesLoop;
			}

			if (!Object.keys(avaibleSources).includes(source)) {
				this.infoLog(`The source "${source}" doesn't exist, skipping...`);

				continue;
			}

			const lyrics = await avaibleSources[source](metadata, lyricsType);

			if (!lyrics) continue;

			if (lyrics?.plain && !lyricsData.plain.lyrics) {
				lyricsData.plain.lyrics = lyrics.plain;
				lyricsData.plain.source = lyrics.source;
			}

			if (lyrics?.lineSynced && !lyricsData.lineSynced.lyrics) {
				lyricsData.lineSynced.lyrics = lyrics.lineSynced;
				lyricsData.lineSynced.source = lyrics.source;
			}

			if (lyrics?.wordSynced && !lyricsData.wordSynced.lyrics) {
				lyricsData.wordSynced.lyrics = lyrics.wordSynced;
				lyricsData.wordSynced.source = lyrics.source;
			}
		}

		return lyricsData;
	}

	/**
	 * Fetches from the {@link Data#cache cache} or the {@link Data#sources sources}, the song based on the track's {@link Metadata metadata} or ID
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album}, {@link Metadata#length duration} or {@link Metadata#trackId ID}
	 * @param skipCache Whetever skip cache check or not
	 * @returns The lyrics of the song when avaible
	 * @example
	 * ```js
	 * const LyricsManager = new SyncLyrics()
	 *
	 * LyricsManager.getLyrics({
	 *     track: "the old me", // Song name
	 *     artist: "Henry Moodie", // Song artist
	 *     album: "good old days", // Song album
	 *     length: 175000, // Song duration, in ms
	 * }).then(console.log)
	 * ```
	 */
	public async getLyrics(
		metadata: Metadata,
		skipCache?: boolean,
	): Promise<LyricsOutput> {
		if (
			!metadata?.track &&
			!metadata?.artist &&
			!metadata?.album &&
			!metadata?.trackId
		)
			throw new Error(
				"SyncLyrics (getlyrics): At least one of track, artist, album or trackId must be present",
			);

		this._trackId =
			metadata.trackId ||
			btoa(
				unescape(
					encodeURIComponent(
						`${metadata.track || ""}----${metadata.artist || ""}----${metadata.album || ""}`,
					),
				),
			);

		let lyricsFetchType: LyricType = Array.isArray(metadata.lyricsType)
			? metadata.lyricsType
			: ["plain", "lineSynced", "wordSynced"]

		if (lyricsFetchType.length <= 0) lyricsFetchType = ["plain", "lineSynced", "wordSynced"]

		const cachedLyrics = skipCache ? null : this.cache.get(this._trackId);

		if (metadata.trackId && !cachedLyrics) {
			const decodedId = atob(metadata.trackId)
			const splitId = decodedId.split('----')

			const track = splitId.shift() || ''
			const artist = splitId.shift() || ''
			const album = splitId.shift() || ''

			return await this.getLyrics({
				track,
				artist,
				album,
				lyricsType: lyricsFetchType
			})
		}

		const lyrics = cachedLyrics || (await this._getLyrics(metadata, lyricsFetchType));

		if (
			!skipCache &&
			(!this.cache.has(this._trackId) ||
				(lyrics?.plain.lyrics && !cachedLyrics?.plain.lyrics) ||
				(lyrics?.lineSynced.lyrics && !cachedLyrics?.lineSynced.lyrics) ||
				(lyrics?.wordSynced.lyrics && !cachedLyrics?.wordSynced.lyrics))
		)
			this.cache.set(
				this._trackId,
				lyrics || {
					plain: {
						lyrics: null,
						source: null,
					},
					lineSynced: {
						lyrics: null,
						source: null,
					},
					wordSynced: {
						lyrics: null,
						source: null,
					},
				},
			);

		if (!lyrics)
			return {
				trackId: this._trackId,
				lyrics: {
					plain: {
						lyrics: null,
						source: null,
					},
					lineSynced: {
						lyrics: null,
						source: null,
						parse: this.parseLyrics,
					},
					wordSynced: {
						lyrics: null,
						source: null,
					},
				},
				track: metadata.track,
				artist: metadata.artist,
				album: metadata.album,
				cached: false,
			};

		this.lyrics = lyrics.lineSynced.lyrics;

		return {
			trackId: this._trackId,
			lyrics: {
				...lyrics,
				lineSynced: {
					...lyrics.lineSynced,
					parse: this.parseLyrics,
				},
			},
			track: metadata.track,
			artist: metadata.artist,
			album: metadata.album,
			cached: !!cachedLyrics,
		};
	}

	/**
	 * Parses LRC formatted lyrics into an array of {@link FormattedLyric#text text} and {@link FormattedLyric#time time}
	 * @param lyrics The lineSynced lyrics (or any string in the {@link !LRC_file_format LRC}) returned by {@link SyncLyrics#getLyrics getLyrics}
	 * @returns The lyrics as an {@link FormattedLyric array of time and text}
	 */
	public parseLyrics(
		lyrics: string | null | undefined = this.lyrics,
	): Array<FormattedLyric> | null {
		const lyricsSplit = lyrics?.split("\n");

		if (!lyricsSplit) return null;

		const formattedLyrics: Array<FormattedLyric> = [];
		let lastTime: string;

		for (const index in lyricsSplit) {
			const lyricText = lyricsSplit[index].split(" ");

			// @ts-ignore
			const time = lyricText.shift().replace(/[\[\]]/g, "");
			const text = lyricText.join(" ");

			const minutes = time.split(":")[0];
			const seconds = time.split(":")[1];

			const totalSeconds =
				Number.parseFloat(minutes) * 60 + Number.parseFloat(seconds);

			const instrumentalLyricIndicator =
				this.instrumentalLyricsIndicator || " ";

			if (index === "0" && totalSeconds > 3 && instrumentalLyricIndicator) {
				formattedLyrics.push({
					time: 0,
					text: instrumentalLyricIndicator,
				});
			}

			if (text.length > 0) {
				lastTime = time;

				formattedLyrics.push({
					time: totalSeconds,
					text: text,
				});

				continue;
			}

			// @ts-ignore
			if (instrumentalLyricIndicator && (!lastTime || lastTime - time > 3)) {
				lastTime = time;

				formattedLyrics.push({
					time: totalSeconds,
					text: instrumentalLyricIndicator,
				});
			}
		}

		return formattedLyrics;
	}

	/**
	 * Converts song's {@link Metadata metadata} into its ID used in the {@link SyncLyrics#cache cache}
	 * @param metadata The song's {@link Metadata#track name}, {@link Metadata#artist artist}, {@link Metadata#album album}, {@link Metadata#length duration} or {@link Metadata#trackId ID}
	 * @returns Base64 encoded {@link Metadata metadata} (used as ID in the {@link SyncLyrics#cache cache})
	 * @example
	 * ```js
	 * const LyricsManager = new SyncLyrics()
	 *
	 * LyricsManager.getTrackId({
	 *     track: "the old me", // Song name
	 *     artist: "Henry Moodie", // Song artist
	 *     album: "good old days", // Song album
	 *     length: 175000, // Song duration, in ms
	 * }).then(console.log)
	 * ```
	 */
	public getTrackId(metadata: Metadata): string {
		if (metadata.trackId) return metadata.trackId;

		return btoa(
			unescape(
				encodeURIComponent(
					`${metadata.track || ""}----${metadata.artist || ""}----${metadata.album || ""}`,
				),
			),
		);
	}

	/**
	 * Updates or resets the log level
	 * @param logLevel The new {@link Data#logLevel logLevel}
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setLogLevel(logLevel?: LogLevel): this {
		if (!logLevel) {
			this.logLevel = "none";

			return this;
		}

		if (!Object.keys(logLevels).includes(logLevel))
			throw new Error(
				`SyncLyrics: logLevel must be one of "${Object.keys(logLevels).join('" | "')}"`,
			);

		this.logLevel = logLevel;

		return this;
	}

	/**
	 * Updates or resets the instrumental lyrics indicator (character used when there are more than 3 seconds of music without lyrics)
	 * @param instrumentalLyricsIndicator The new {@link Data#instrumentalLyricsIndicator instrumentalLyricsIndicator}
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setInstrumentalLyricsIndicator(
		instrumentalLyricsIndicator?: string,
	): this {
		if (!instrumentalLyricsIndicator) {
			this.instrumentalLyricsIndicator = "";

			return this;
		}

		if (typeof instrumentalLyricsIndicator !== "string")
			throw new Error(
				"SyncLyrics: instrumentalLyricsIndicator must be a string",
			);

		this.instrumentalLyricsIndicator = instrumentalLyricsIndicator;

		return this;
	}

	/**
	 * Updates or resets the sources
	 * @param sources The new {@link Data#sources sources}
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setSources(sources?: Sources): this {
		if (!sources) {
			this.sources = ["musixmatch", "lrclib", "netease"];

			return this;
		}

		if (!Array.isArray(sources) || sources.length <= 0)
			throw new Error(
				'SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"',
			);

		this.sources = sources;

		return this;
	}

	/**
	 * Updates or resets the cache
	 * @param cache The new {@link Data#cache cache}
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setCache(
		cache?: Cache<
			string | null | undefined,
			CacheLyrics | null | undefined | null
		>,
	): this {
		if (!cache) {
			this.cache = new Map();

			return this;
		}

		if (
			typeof cache.get !== "function" ||
			typeof cache.set !== "function" ||
			typeof cache.has !== "function"
		)
			throw new Error(
				"SyncLyrics: cache must have .get, .set and .has methods",
			);

		this.cache = cache;

		return this;
	}

	/**
	 * Updates or removes the saveMusixmatchToken function
	 * @param saveMusixmatchToken The new {@link Data#saveMusixmatchToken saveMusixmatchToken} function
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setSaveMusixmatchToken(
		saveMusixmatchToken?: (tokenData: TokenData) => void | Promise<void>,
	): this {
		if (typeof saveMusixmatchToken !== "function")
			throw new Error("SyncLyrics: saveMusixmatchToken must be a function");

		this.saveMusixmatchToken = saveMusixmatchToken;

		return this;
	}

	/**
	 * Updates or removes the getMusixmatchToken function
	 * @param getMusixmatchToken The new {@link Data#getMusixmatchToken getMusixmatchToken} function
	 * @returns Updated {@link SyncLyrics} instance
	 */
	public setGetMusixmatchToken(
		getMusixmatchToken?: () => TokenData | Promise<TokenData>,
	): this {
		if (typeof getMusixmatchToken !== "function")
			throw new Error("SyncLyrics: getMusixmatchToken must be a function");

		this.getMusixmatchToken = getMusixmatchToken;

		return this;
	}

	/**
	 * Logs the text with a yellow "WARN: " prefix
	 * @param args Text to log
	 * @returns Nothing
	 */
	private warnLog(...args: any): void {
		if ((logLevels[this.logLevel] || 0) < logLevels.warn) return;

		console.warn("\x1b[33;1mWARNING:\x1b[0m", ...args);
	}

	/**
	 * Logs the text with a purple "DEBUG: " prefix
	 * @param args Text to log
	 * @returns Nothing
	 */
	private debugLog(...args: any): void {
		if ((logLevels[this.logLevel] || 0) < logLevels.debug) return;

		console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
	}

	/**
	 * Logs the text with a red "ERROR: " prefix
	 * @param args Text to log
	 * @returns Nothing
	 */
	private errorLog(...args: any): void {
		if ((logLevels[this.logLevel] || 0) < logLevels.debug) return;

		console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
	}

	/**
	 * Logs the text with a blue "INFO: " prefix
	 * @param args Text to log
	 * @returns Nothing
	 */
	private infoLog(...args: any): void {
		if ((logLevels[this.logLevel] || 0) < logLevels.info) return;

		console.info("\x1b[34;1mINFO:\x1b[0m", ...args);
	}
}

/**
 * Parses special characters (Usually returned by {@link !Netease Netease}) into common characters
 * @param string The string to parse
 * @returns Parsed string with common characters
 */
export function normalize(string: string): string {
	return string
		.replace(/（/g, "(")
		.replace(/）/g, ")")
		.replace(/【/g, "[")
		.replace(/】/g, "]")
		.replace(/。/g, ". ")
		.replace(/；/g, "; ")
		.replace(/：/g, ": ")
		.replace(/？/g, "? ")
		.replace(/！/g, "! ")
		.replace(/、|，/g, ", ")
		.replace(/‘|’|′|＇/g, "'")
		.replace(/“|”/g, '"')
		.replace(/〜/g, "~")
		.replace(/·|・/g, "•")
		.replace(/\s+/g, " ")
		.trim();
}

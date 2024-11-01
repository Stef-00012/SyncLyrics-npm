import { promisify } from "util";

const sleep = promisify(setTimeout);

export type Sources = Array<"musixmatch" | "lrclib" | "netease">;

const logLevels = {
	debug: 4,
	error: 3,
	warn: 2,
	info: 1,
	none: 0,
};

export interface TokenData {
	usertoken: string;
	cookies: string | undefined;
	expiresAt: number;
}

export interface Metadata {
	track?: string;
	artist?: string;
	album?: string;
	length?: number;
	trackId?: string;
}

export interface LyricsCache {
	lyrics: string | null;
	trackId: string | null;
}

export interface Cache<K, V> {
	set(key: K, value: V): void;
	get(key: K): V | undefined | null;
	has(key: K): boolean;
	[key: string]: any;
}

export interface Data {
	logLevel?: "none" | "info" | "warn" | "error" | "debug";
	instrumentalLyricsIndicator?: string;
	sources?: Sources;
	trackId?: string;
	cache?: Cache<
		string | null | undefined,
		| {
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
		  }
		| null
		| undefined
		| null
	>;
	saveMusixmatchToken?: (tokenData: TokenData) => void;
	getMusixmatchToken?: () => TokenData | null | undefined;
}

export interface FormattedLyric {
	time: number;
	text: string;
}

export class SyncLyrics {
	logLevel: "none" | "info" | "warn" | "error" | "debug";
	instrumentalLyricsIndicator: string;
	sources: Sources;
	lyrics: string | null | undefined;
	cache: Cache<
		string | null | undefined,
		| {
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
		  }
		| null
		| undefined
		| null
	>;
	saveMusixmatchToken:
		| null
		| undefined
		| ((tokenData: TokenData) => void | Promise<void>);
	getMusixmatchToken:
		| null
		| undefined
		| (() =>
				| TokenData
				| Promise<TokenData | null | undefined>
				| null
				| undefined);

	_cache: LyricsCache | null;
	_fetching: boolean;
	_fetchingTrackId: string | null;
	_fetchingSource: string | null;
	_trackId: string | null;

	constructor(data?: Data) {
		this.logLevel = data?.logLevel || "none";
		this.instrumentalLyricsIndicator = data?.instrumentalLyricsIndicator || "";
		this.sources = data?.sources || ["musixmatch", "lrclib", "netease"];
		this.cache = data?.cache || new Map();
		this.saveMusixmatchToken = data?.saveMusixmatchToken;
		this.getMusixmatchToken = data?.getMusixmatchToken;

		if (this.sources.length <= 0)
			throw new Error("SyncLyrics: You must provide atleast one source");

		this.lyrics = null;

		this._cache = null;
		this._fetching = false;
		this._fetchingTrackId = null;
		this._fetchingSource = null;
		this._trackId = data?.trackId || null;

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

	private async _searchLyricsMusixmatch(
		metadata: Metadata,
		tokenData: TokenData,
	) {
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

	private async _fetchWordSyncedLyricsMusixmatch(
		tokenData: TokenData,
		trackId: string,
	): Promise<Array<{
		end: number;
		start: number;
		lyric: string;
		syncedLyric: Array<{ character: string; time: number }>;
	}> | null> {
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

	private async _fetchLyricsMusixmatch(
		metadata: Metadata,
		tokenData: TokenData,
		trackId: string,
		commonTrackId: string,
		hasLyrics: boolean,
		hasLineSyncedLyrics: boolean,
		hasWordSyncedLyrics: boolean,
	) {
		if (
			!metadata ||
			(!commonTrackId && !trackId) ||
			!tokenData ||
			(!hasLyrics && !hasLineSyncedLyrics && !hasWordSyncedLyrics)
		)
			return null;

		const lyricsData: {
			plain: string | null;
			lineSynced: string | null;
			wordSynced: Array<{
				end: number;
				start: number;
				lyric: string;
				syncedLyric: Array<{ character: string; time: number }>;
			}> | null;
		} = {
			plain: null,
			lineSynced: null,
			wordSynced: null,
		};

		if (hasLyrics && commonTrackId)
			lyricsData.plain = await this._fetchPlainLyricsMusixmatch(
				tokenData,
				commonTrackId,
			);
		if (hasLineSyncedLyrics && commonTrackId)
			lyricsData.lineSynced = await this._fetchLineSyncedLyricsMusixmatch(
				tokenData,
				commonTrackId,
			);
		if (hasWordSyncedLyrics && commonTrackId)
			lyricsData.wordSynced = await this._fetchWordSyncedLyricsMusixmatch(
				tokenData,
				trackId,
			);

		return lyricsData;
	}

	private async _searchLyricsNetease(metadata: Metadata) {
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

	private async _fetchLyricsNetease(metadata: Metadata, trackId: string) {
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

	private _parseNeteaseLyrics(slyrics: string) {
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

	private async fetchLyricsLrclib(metadata: Metadata) {
		if (!metadata) return;

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

	private async fetchLyricsMusixmatch(metadata: Metadata) {
		if (!metadata) return;

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
		);

		return {
			source: "Musixmatch",
			...lyrics,
		};
	}

	private async fetchLyricsNetease(metadata: Metadata) {
		if (!metadata) return;

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

	private async _getLyrics(metadata: Metadata) {
		if (this._fetching && this._fetchingTrackId === this._trackId) {
			this.warnLog(
				`Already fetching from the source "${this._fetchingSource}" (Track ID: "${this._fetchingTrackId}")`,
			);

			return null;
		}

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
				if (type === "plain" && lyricsData.plain.lyrics) sourceSkip++;
				if (type === "line" && lyricsData.lineSynced.lyrics) sourceSkip++;
				if (type === "word" && lyricsData.wordSynced.lyrics) sourceSkip++;

				if (sourceSkip >= avaibleTypes.length) continue sourcesLoop;
			}

			if (!Object.keys(avaibleSources).includes(source)) {
				this.infoLog(`The source "${source}" doesn't exist, skipping...`);

				continue;
			}

			this._fetching = true;
			this._fetchingSource = source;
			this._fetchingTrackId = this._trackId;

			const lyrics = await avaibleSources[source](metadata);

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

	public async getLyrics(metadata: Metadata, skipCache: boolean) {
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
						`${metadata.track || ""}-${metadata.artist || ""}-${metadata.album || ""}`,
					),
				),
			);

		const cachedLyrics = skipCache ? null : this.cache.get(this._trackId);

		const lyrics = cachedLyrics || (await this._getLyrics(metadata));

		if (!this.cache.has(this._trackId) && !skipCache)
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

	public parseLyrics(lyrics: string | null | undefined = this.lyrics) {
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

	public getTrackId(metadata: Metadata) {
		if (metadata.trackId) return metadata.trackId;

		return btoa(
			unescape(
				encodeURIComponent(
					`${metadata.track || ""}-${metadata.artist || ""}-${metadata.album || ""}`,
				),
			),
		);
	}

	private warnLog(...args: any) {
		if ((logLevels[this.logLevel] || 0) < logLevels.warn) return;

		console.warn("\x1b[33;1mWARNING:\x1b[0m", ...args);
	}

	private debugLog(...args: any) {
		if ((logLevels[this.logLevel] || 0) < logLevels.debug) return;

		console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
	}

	private errorLog(...args: any) {
		if ((logLevels[this.logLevel] || 0) < logLevels.debug) return;

		console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
	}

	private infoLog(...args: any) {
		if ((logLevels[this.logLevel] || 0) < logLevels.info) return;

		console.info("\x1b[34;1mINFO:\x1b[0m", ...args);
	}
}

export function normalize(string: string) {
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

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncLyrics = void 0;
exports.normalize = normalize;
const util_1 = require("util");
const sleep = (0, util_1.promisify)(setTimeout);
const logLevels = {
    debug: 4,
    error: 3,
    warn: 2,
    info: 1,
    none: 0,
};
class SyncLyrics {
    constructor(data) {
        if (typeof (data === null || data === void 0 ? void 0 : data.logLevel) === "string" &&
            !Object.keys(logLevels).includes(data.logLevel))
            throw new Error(`SyncLyrics: logLevel must be one of "${Object.keys(logLevels).join('" | "')}"`);
        if ((data === null || data === void 0 ? void 0 : data.instrumentalLyricsIndicator) &&
            typeof data.instrumentalLyricsIndicator !== "string")
            throw new Error("SyncLyrics: instrumentalLyricsIndicator must be a string");
        if ((data === null || data === void 0 ? void 0 : data.sources) &&
            (!Array.isArray(data.sources) || data.sources.length <= 0))
            throw new Error('SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"');
        if ((data === null || data === void 0 ? void 0 : data.cache) &&
            (typeof data.cache.get !== "function" ||
                typeof data.cache.set !== "function" ||
                typeof data.cache.has !== "function"))
            throw new Error("SyncLyrics: cache must have .get, .set and .has methods");
        if ((data === null || data === void 0 ? void 0 : data.saveMusixmatchToken) &&
            typeof data.saveMusixmatchToken !== "function")
            throw new Error("SyncLyrics: saveMusixmatchToken must be a function");
        if ((data === null || data === void 0 ? void 0 : data.getMusixmatchToken) &&
            typeof data.getMusixmatchToken !== "function")
            throw new Error("SyncLyrics: getMusixmatchToken must be a function");
        this.logLevel = (data === null || data === void 0 ? void 0 : data.logLevel) || "none";
        this.instrumentalLyricsIndicator = (data === null || data === void 0 ? void 0 : data.instrumentalLyricsIndicator) || "";
        this.sources = (data === null || data === void 0 ? void 0 : data.sources) || ["musixmatch", "lrclib", "netease"];
        this.cache = (data === null || data === void 0 ? void 0 : data.cache) || new Map();
        this.saveMusixmatchToken = data === null || data === void 0 ? void 0 : data.saveMusixmatchToken;
        this.getMusixmatchToken = data === null || data === void 0 ? void 0 : data.getMusixmatchToken;
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
    getMusixmatchUsertoken(cookies) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            this.infoLog("Getting Musixmatch token...");
            if (!this.saveMusixmatchToken || !this.getMusixmatchToken) {
                this.infoLog("Musixmatch token functions are not avaible, skipping...");
                return null;
            }
            const tokenData = yield this.getMusixmatchToken();
            if (tokenData)
                return tokenData;
            this.infoLog("Fetching the token from the API...");
            const url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?user_language=en&app_id=web-desktop-app-v1.0";
            try {
                const res = yield fetch(url, {
                    redirect: "manual",
                    headers: {
                        cookie: cookies,
                    },
                });
                if (res.status === 301) {
                    this.debugLog("Successfully received the 'set-cookie' redirect response");
                    const setCookie = res.headers
                        .getSetCookie()
                        .map((cookie) => cookie.split(";").shift())
                        .filter((cookie) => cookie.split("=").pop() !== "unknown")
                        .join("; ");
                    this.debugLog("Re-fetching with the cookies...");
                    return yield this.getMusixmatchUsertoken(setCookie);
                }
                if (!res.ok) {
                    this.warnLog(`The usertoken API request failed with the status ${res.status} (${res.statusText})`);
                    return null;
                }
                const data = yield res.json();
                if (((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                    ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha") {
                    this.warnLog("Musixmatch usertoken endpoint is being ratelimited, retrying in 10 seconds...");
                    yield sleep(10000);
                    this.infoLog("Retrying to fetch the Musixmatch usertken...");
                    return yield this.getMusixmatchUsertoken(cookies);
                }
                const usertoken = (_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.user_token;
                if (!usertoken) {
                    this.infoLog("The API response did not include the usertoken");
                    return null;
                }
                const json = {
                    cookies,
                    usertoken,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000).getTime(),
                };
                yield this.saveMusixmatchToken(json);
                this.infoLog("Successfully fetched the usertoken");
                return json;
            }
            catch (e) { }
        });
    }
    _searchLyricsMusixmatch(metadata, tokenData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            if (!metadata || !tokenData)
                return null;
            const duration = Number.parseFloat(metadata.length) / 1000;
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
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.search?${searchParams}`;
            try {
                this.debugLog("Musixmatch search fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Search]`);
                    return null;
                }
                const data = yield res.json();
                if (((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                    ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha) [Musixmatch - Search]");
                    return null;
                }
                this.debugLog("Musixmatch search results:", (_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.track_list);
                if (((_j = (_h = (_g = data === null || data === void 0 ? void 0 : data.message) === null || _g === void 0 ? void 0 : _g.body) === null || _h === void 0 ? void 0 : _h.track_list) === null || _j === void 0 ? void 0 : _j.length) <= 0) {
                    this.infoLog("No songs were found [Musixmatch - Search]");
                    return null;
                }
                const track = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.message) === null || _k === void 0 ? void 0 : _k.body) === null || _l === void 0 ? void 0 : _l.track_list) === null || _m === void 0 ? void 0 : _m.find((listItem) => {
                    var _a, _b, _c, _d;
                    return ((_a = listItem.track.track_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ===
                        ((_b = metadata.track) === null || _b === void 0 ? void 0 : _b.toLowerCase()) &&
                        ((_c = listItem.track.artist_name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes((_d = metadata.artist) === null || _d === void 0 ? void 0 : _d.toLowerCase()));
                });
                this.debugLog("Musixmatch search filtered track:", track);
                if (!track) {
                    this.infoLog("No songs were found with the current name and artist [Musixmatch - Search]");
                    return null;
                }
                this.debugLog(track);
                const commonTrackId = (_o = track === null || track === void 0 ? void 0 : track.track) === null || _o === void 0 ? void 0 : _o.commontrack_id;
                const trackId = (_p = track === null || track === void 0 ? void 0 : track.track) === null || _p === void 0 ? void 0 : _p.track_id;
                const hasLyrics = (_q = track === null || track === void 0 ? void 0 : track.track) === null || _q === void 0 ? void 0 : _q.has_lyrics;
                const hasLineSyncedLyrics = (_r = track === null || track === void 0 ? void 0 : track.track) === null || _r === void 0 ? void 0 : _r.has_subtitles;
                const hasWordSyncedLyrics = (_s = track === null || track === void 0 ? void 0 : track.track) === null || _s === void 0 ? void 0 : _s.has_richsync;
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
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Search]", e);
                return null;
            }
        });
    }
    _fetchPlainLyricsMusixmatch(tokenData, commonTrackId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!tokenData || !commonTrackId)
                return null;
            const searchParams = new URLSearchParams({
                app_id: "web-desktop-app-v1.0",
                usertoken: tokenData.usertoken,
                commontrack_id: commonTrackId,
            });
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.lyrics.get?${searchParams}`;
            try {
                this.debugLog("Musixmatch lyrics fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Lyrics]`);
                    return null;
                }
                const data = yield res.json();
                if (((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                    ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Lyrics]");
                    return null;
                }
                this.debugLog("Musixmatch track data:", (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body);
                const lyrics = (_h = (_g = (_f = data === null || data === void 0 ? void 0 : data.message) === null || _f === void 0 ? void 0 : _f.body) === null || _g === void 0 ? void 0 : _g.lyrics) === null || _h === void 0 ? void 0 : _h.lyrics_body;
                if (!lyrics) {
                    this.infoLog("Missing Lyrics [Musixmatch - Lyrics]");
                    return null;
                }
                this.infoLog("Successfully fetched and cached the plain lyrics [Musixmatch]");
                return lyrics;
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Lyrics]", e);
                return null;
            }
        });
    }
    _fetchLineSyncedLyricsMusixmatch(tokenData, commonTrackId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!tokenData || !commonTrackId)
                return null;
            const searchParams = new URLSearchParams({
                app_id: "web-desktop-app-v1.0",
                usertoken: tokenData.usertoken,
                commontrack_id: commonTrackId,
            });
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get?${searchParams}`;
            try {
                this.debugLog("Musixmatch synced lyrics fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Synced Lyrics]`);
                    return null;
                }
                const data = yield res.json();
                if (((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                    ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Synced Lyrics]");
                    return null;
                }
                this.debugLog("Musixmatch track data:", (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body);
                const lyrics = (_h = (_g = (_f = data === null || data === void 0 ? void 0 : data.message) === null || _f === void 0 ? void 0 : _f.body) === null || _g === void 0 ? void 0 : _g.subtitle) === null || _h === void 0 ? void 0 : _h.subtitle_body;
                if (!lyrics) {
                    this.infoLog("Missing Lyrics [Musixmatch - Synced Lyrics]");
                    return null;
                }
                this.infoLog("Successfully fetched and cached the synced lyrics [Musixmatch]");
                return lyrics;
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Synced Lyrics]", e);
                return null;
            }
        });
    }
    _fetchWordSyncedLyricsMusixmatch(tokenData, trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!tokenData || !trackId)
                return null;
            const searchParams = new URLSearchParams({
                app_id: "web-desktop-app-v1.0",
                usertoken: tokenData.usertoken,
                track_id: trackId,
            });
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.richsync.get?${searchParams}`;
            try {
                this.debugLog("Musixmatch lyrics fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Word Synced Lyrics]`);
                    return null;
                }
                const data = yield res.json();
                if (((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                    ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Word Synced Lyrics]");
                    return null;
                }
                this.debugLog("Musixmatch track data:", (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body);
                let lyrics = (_h = (_g = (_f = data === null || data === void 0 ? void 0 : data.message) === null || _f === void 0 ? void 0 : _f.body) === null || _g === void 0 ? void 0 : _g.richsync) === null || _h === void 0 ? void 0 : _h.richsync_body;
                if (!lyrics || lyrics.length <= 0) {
                    this.infoLog("Missing Lyrics [Musixmatch - Word Synced Lyrics]");
                    return null;
                }
                lyrics = JSON.parse(lyrics);
                const parsedLyrics = lyrics.map((line) => {
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
                });
                this.infoLog("Successfully fetched and cached the synced lyrics [Musixmatch]");
                return parsedLyrics;
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Word Synced Lyrics]", e);
                return null;
            }
        });
    }
    _fetchLyricsMusixmatch(metadata, tokenData, trackId, commonTrackId, hasLyrics, hasLineSyncedLyrics, hasWordSyncedLyrics) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metadata ||
                (!commonTrackId && !trackId) ||
                !tokenData ||
                (!hasLyrics && !hasLineSyncedLyrics && !hasWordSyncedLyrics))
                return null;
            const lyricsData = {
                plain: null,
                lineSynced: null,
                wordSynced: null,
            };
            if (hasLyrics && commonTrackId)
                lyricsData.plain = yield this._fetchPlainLyricsMusixmatch(tokenData, commonTrackId);
            if (hasLineSyncedLyrics && commonTrackId)
                lyricsData.lineSynced = yield this._fetchLineSyncedLyricsMusixmatch(tokenData, commonTrackId);
            if (hasWordSyncedLyrics && commonTrackId)
                lyricsData.wordSynced = yield this._fetchWordSyncedLyricsMusixmatch(tokenData, trackId);
            return lyricsData;
        });
    }
    _searchLyricsNetease(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const searchParams = new URLSearchParams({
                limit: 10,
                type: 1,
                keywords: `${metadata.track} ${metadata.artist}`,
            });
            const url = `https://music.xianqiao.wang/neteaseapiv2/search?${searchParams}`;
            try {
                this.debugLog("Netease search fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Netease - Search]`);
                    return null;
                }
                const data = yield res.json();
                if (!((_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.songs) || ((_c = (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.songs) === null || _c === void 0 ? void 0 : _c.length) <= 0) {
                    this.infoLog("No songs were found [Netease - Search]");
                    return null;
                }
                const track = (_e = (_d = data === null || data === void 0 ? void 0 : data.result) === null || _d === void 0 ? void 0 : _d.songs) === null || _e === void 0 ? void 0 : _e.find((listItem) => {
                    var _a, _b;
                    return ((_a = listItem.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = metadata.track) === null || _b === void 0 ? void 0 : _b.toLowerCase()) &&
                        (listItem.artists.some((artist) => {
                            var _a, _b, _c;
                            return (_b = (_a = artist.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes((_c = metadata.artist) === null || _c === void 0 ? void 0 : _c.toLowerCase());
                        }) ||
                            listItem.artists.some((artist) => {
                                var _a, _b, _c, _d, _e;
                                return (_c = (_b = (_a = artist.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.replace(/-/g, " ")) === null || _c === void 0 ? void 0 : _c.includes((_e = (_d = metadata.artist) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === null || _e === void 0 ? void 0 : _e.replace(/-/g, " "));
                            }));
                });
                this.debugLog("Netease search filtered track:", track);
                if (!track) {
                    this.infoLog("No songs were found with the current name and artist [Netease - Search]");
                    return null;
                }
                const trackId = track.id;
                this.debugLog("Neteasw track ID", trackId);
                return trackId;
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Netease - Search]", e);
                return null;
            }
        });
    }
    _fetchLyricsNetease(metadata, trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!metadata || !trackId)
                return null;
            const searchParams = new URLSearchParams({
                id: trackId,
            });
            const url = `https://music.xianqiao.wang/neteaseapiv2/lyric?${searchParams}`;
            try {
                this.debugLog("Netease lyrics fetch URL:", url);
                const res = yield fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Netease - Lyrics]`);
                    return null;
                }
                const data = yield res.json();
                this.debugLog("Netease track data:", data);
                let lyrics = (_a = data === null || data === void 0 ? void 0 : data.lrc) === null || _a === void 0 ? void 0 : _a.lyric;
                if (!lyrics) {
                    this.infoLog("Missing Lyrics [Netease - Lyrics]");
                    return null;
                }
                lyrics = this._parseNeteaseLyrics(lyrics);
                this.infoLog("Successfully fetched and cached the synced lyrics [Netease]");
                return lyrics;
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [Netease - Lyrics]", e);
                return null;
            }
        });
    }
    _parseNeteaseLyrics(slyrics) {
        const lines = slyrics.split(/\r?\n/).map((line) => line.trim());
        const lyrics = [];
        const creditInfo = [
            "\\s?作?\\s*词|\\s?作?\\s*曲|\\s?编\\s*曲?|\\s?监\\s*制?",
            ".*编写|.*和音|.*和声|.*合声|.*提琴|.*录|.*工程|.*工作室|.*设计|.*剪辑|.*制作|.*发行|.*出品|.*后期|.*混音|.*缩混",
            "原唱|翻唱|题字|文案|海报|古筝|二胡|钢琴|吉他|贝斯|笛子|鼓|弦乐| 人声 ",
            "lrc|publish|vocal|guitar|program|produce|write|mix",
        ];
        const creditInfoRegExp = new RegExp(`^(${creditInfo.join("|")}).*(:|：)`, "i");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
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
    fetchLyricsLrclib(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!metadata)
                return null;
            this.infoLog(`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [LRCLIB]`);
            const searchParams = new URLSearchParams({
                track_name: metadata.track,
                artist_name: metadata.artist,
                album_name: metadata.album,
                q: metadata.track,
            });
            const url = `https://lrclib.net/api/search?${searchParams}`;
            try {
                const res = yield fetch(url, {
                    headers: {
                        "Lrclib-Client": "SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
                        "User-Agent": "SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [LRCLIB]`);
                    return null;
                }
                const data = yield res.json();
                this.debugLog("lrclib.net results:", data);
                const match = data.find((d) => {
                    var _a, _b, _c, _d;
                    return ((_a = d.artistName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes((_b = metadata.artist) === null || _b === void 0 ? void 0 : _b.toLowerCase())) &&
                        ((_c = d.trackName) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === ((_d = metadata.track) === null || _d === void 0 ? void 0 : _d.toLowerCase());
                });
                this.debugLog("lrclib filtered track:", match);
                if (!match ||
                    ((!match.syncedLyrics || ((_a = match.syncedLyrics) === null || _a === void 0 ? void 0 : _a.length) <= 0) &&
                        (!match.plainLyrics || ((_b = match.plainLyrics) === null || _b === void 0 ? void 0 : _b.length) <= 0))) {
                    this.infoLog("The fetched song does not have lyrics [LRCLIB]");
                    return null;
                }
                this.infoLog("Successfully fetched and cached the lyrics [LRCLIB]");
                return {
                    source: "lrclib.net",
                    plain: match === null || match === void 0 ? void 0 : match.plainLyrics,
                    lineSynced: match === null || match === void 0 ? void 0 : match.syncedLyrics,
                    wordSynced: null,
                };
            }
            catch (e) {
                this.errorLog("Something went wrong while fetching the lyrics [LRCLIB]", e);
                return null;
            }
        });
    }
    fetchLyricsMusixmatch(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metadata)
                return null;
            const tokenData = yield this.getMusixmatchUsertoken();
            this.debugLog("Musixmatch token data:", tokenData);
            if (!tokenData)
                return null;
            this.infoLog(`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [Musixmatch]`);
            const trackData = yield this._searchLyricsMusixmatch(metadata, tokenData);
            if (!trackData ||
                (!trackData.hasLyrics &&
                    !trackData.hasLineSyncedLyrics &&
                    !trackData.hasWordSyncedLyrics) ||
                (!trackData.commonTrackId && !trackData.trackId)) {
                this.infoLog("Missing both commontrack_id and track_id [Musixmatch - Search]");
                return null;
            }
            const lyrics = yield this._fetchLyricsMusixmatch(metadata, tokenData, trackData.trackId, trackData.commonTrackId, trackData.hasLyrics, trackData.hasLineSyncedLyrics, trackData.hasWordSyncedLyrics);
            return Object.assign({ source: "Musixmatch" }, lyrics);
        });
    }
    fetchLyricsNetease(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metadata)
                return null;
            const trackId = yield this._searchLyricsNetease(metadata);
            if (!trackId) {
                this.infoLog("Missing track ID [Netease - Search]");
                return null;
            }
            const lyrics = yield this._fetchLyricsNetease(metadata, trackId);
            return {
                source: "Netease",
                lineSynced: lyrics,
                plain: null,
                wordSynced: null,
            };
        });
    }
    _getLyrics(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let sources = this.sources || ["musixmatch", "lrclib", "netease"];
            const lyricsData = {
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
            if (sources.every((source) => !Object.keys(avaibleSources).includes(source)))
                sources = ["musixmatch", "lrclib", "netease"];
            sourcesLoop: for (const source of sources) {
                this.infoLog(`Trying to fetch the lyrics from the source "${source}"`);
                if (source === "musixmatch" &&
                    (!this.saveMusixmatchToken || !this.getMusixmatchToken)) {
                    this.infoLog("Musixmatch token functions are not avaible, skipping...");
                    continue;
                }
                let sourceSkip = 0;
                const avaibleTypes = sourcesTypes[source];
                for (const type of avaibleTypes) {
                    if (type === "plain" && lyricsData.plain.lyrics)
                        sourceSkip++;
                    if (type === "line" && lyricsData.lineSynced.lyrics)
                        sourceSkip++;
                    if (type === "word" && lyricsData.wordSynced.lyrics)
                        sourceSkip++;
                    if (sourceSkip >= avaibleTypes.length)
                        continue sourcesLoop;
                }
                if (!Object.keys(avaibleSources).includes(source)) {
                    this.infoLog(`The source "${source}" doesn't exist, skipping...`);
                    continue;
                }
                const lyrics = yield avaibleSources[source](metadata);
                if (!lyrics)
                    continue;
                if ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.plain) && !lyricsData.plain.lyrics) {
                    lyricsData.plain.lyrics = lyrics.plain;
                    lyricsData.plain.source = lyrics.source;
                }
                if ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.lineSynced) && !lyricsData.lineSynced.lyrics) {
                    lyricsData.lineSynced.lyrics = lyrics.lineSynced;
                    lyricsData.lineSynced.source = lyrics.source;
                }
                if ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.wordSynced) && !lyricsData.wordSynced.lyrics) {
                    lyricsData.wordSynced.lyrics = lyrics.wordSynced;
                    lyricsData.wordSynced.source = lyrics.source;
                }
            }
            return lyricsData;
        });
    }
    getLyrics(metadata, skipCache) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(metadata === null || metadata === void 0 ? void 0 : metadata.track) &&
                !(metadata === null || metadata === void 0 ? void 0 : metadata.artist) &&
                !(metadata === null || metadata === void 0 ? void 0 : metadata.album) &&
                !(metadata === null || metadata === void 0 ? void 0 : metadata.trackId))
                throw new Error("SyncLyrics (getlyrics): At least one of track, artist, album or trackId must be present");
            this._trackId =
                metadata.trackId ||
                    btoa(unescape(encodeURIComponent(`${metadata.track || ""}-${metadata.artist || ""}-${metadata.album || ""}`)));
            const cachedLyrics = skipCache ? null : this.cache.get(this._trackId);
            const lyrics = cachedLyrics || (yield this._getLyrics(metadata));
            if (!skipCache &&
                (!this.cache.has(this._trackId) ||
                    ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.plain.lyrics) && !(cachedLyrics === null || cachedLyrics === void 0 ? void 0 : cachedLyrics.plain.lyrics)) ||
                    ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.lineSynced.lyrics) && !(cachedLyrics === null || cachedLyrics === void 0 ? void 0 : cachedLyrics.lineSynced.lyrics)) ||
                    ((lyrics === null || lyrics === void 0 ? void 0 : lyrics.wordSynced.lyrics) && !(cachedLyrics === null || cachedLyrics === void 0 ? void 0 : cachedLyrics.wordSynced.lyrics))))
                this.cache.set(this._trackId, lyrics || {
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
                });
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
                lyrics: Object.assign(Object.assign({}, lyrics), { lineSynced: Object.assign(Object.assign({}, lyrics.lineSynced), { parse: this.parseLyrics }) }),
                track: metadata.track,
                artist: metadata.artist,
                album: metadata.album,
                cached: !!cachedLyrics,
            };
        });
    }
    parseLyrics(lyrics = this.lyrics) {
        const lyricsSplit = lyrics === null || lyrics === void 0 ? void 0 : lyrics.split("\n");
        if (!lyricsSplit)
            return null;
        const formattedLyrics = [];
        let lastTime;
        for (const index in lyricsSplit) {
            const lyricText = lyricsSplit[index].split(" ");
            const time = lyricText.shift().replace(/[\[\]]/g, "");
            const text = lyricText.join(" ");
            const minutes = time.split(":")[0];
            const seconds = time.split(":")[1];
            const totalSeconds = Number.parseFloat(minutes) * 60 + Number.parseFloat(seconds);
            const instrumentalLyricIndicator = this.instrumentalLyricsIndicator || " ";
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
    getTrackId(metadata) {
        if (metadata.trackId)
            return metadata.trackId;
        return btoa(unescape(encodeURIComponent(`${metadata.track || ""}-${metadata.artist || ""}-${metadata.album || ""}`)));
    }
    setLogLevel(logLevel) {
        if (!logLevel) {
            this.logLevel = "none";
            return this;
        }
        if (!Object.keys(logLevels).includes(logLevel))
            throw new Error(`SyncLyrics: logLevel must be one of "${Object.keys(logLevels).join('" | "')}"`);
        this.logLevel = logLevel;
        return this;
    }
    setInstrumentalLyricsIndicator(instrumentalLyricsIndicator) {
        if (!instrumentalLyricsIndicator) {
            this.instrumentalLyricsIndicator = "";
            return this;
        }
        if (typeof instrumentalLyricsIndicator !== "string")
            throw new Error("SyncLyrics: instrumentalLyricsIndicator must be a string");
        this.instrumentalLyricsIndicator = instrumentalLyricsIndicator;
        return this;
    }
    setSources(sources) {
        if (!sources) {
            this.sources = ["musixmatch", "lrclib", "netease"];
            return this;
        }
        if (!Array.isArray(sources) || sources.length <= 0)
            throw new Error('SyncLyrics: sources must be an array with atleast one of "musixmatch" | "lrclib" | "netease"');
        this.sources = sources;
        return this;
    }
    setCache(cache) {
        if (!cache) {
            this.cache = new Map();
            return this;
        }
        if (typeof cache.get !== "function" ||
            typeof cache.set !== "function" ||
            typeof cache.has !== "function")
            throw new Error("SyncLyrics: cache must have .get, .set and .has methods");
        this.cache = cache;
        return this;
    }
    setSaveMusixmatchToken(saveMusixmatchToken) {
        if (typeof saveMusixmatchToken !== "function")
            throw new Error("SyncLyrics: saveMusixmatchToken must be a function");
        this.saveMusixmatchToken = saveMusixmatchToken;
        return this;
    }
    setGetMusixmatchToken(getMusixmatchToken) {
        if (typeof getMusixmatchToken !== "function")
            throw new Error("SyncLyrics: getMusixmatchToken must be a function");
        this.getMusixmatchToken = getMusixmatchToken;
        return this;
    }
    warnLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.warn)
            return;
        console.warn("\x1b[33;1mWARNING:\x1b[0m", ...args);
    }
    debugLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.debug)
            return;
        console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
    }
    errorLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.debug)
            return;
        console.debug("\x1b[35;1mDEBUG:\x1b[0m", ...args);
    }
    infoLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.info)
            return;
        console.info("\x1b[34;1mINFO:\x1b[0m", ...args);
    }
}
exports.SyncLyrics = SyncLyrics;
function normalize(string) {
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

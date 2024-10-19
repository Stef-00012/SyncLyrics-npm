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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncLyrics = void 0;
exports.normalize = normalize;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_util_1 = require("node:util");
const sleep = (0, node_util_1.promisify)(setTimeout);
const logLevels = {
    debug: 4,
    error: 3,
    warn: 2,
    info: 1,
    none: 0,
};
class SyncLyrics {
    constructor(data) {
        this.logLevel = (data === null || data === void 0 ? void 0 : data.logLevel) || "none";
        this.instrumentalLyricsIndicator = (data === null || data === void 0 ? void 0 : data.instrumentalLyricsIndicator) || "";
        this.sources = (data === null || data === void 0 ? void 0 : data.sources) || ["musixmatch", "lrclib", "netease"];
        this.saveMusixmatchToken = data.saveMusixmatchToken || this._saveMusixmatchToken;
        this.getMusixmatchToken = data.getMusixmatchToken || this._getMusixmatchToken;
        if (this.sources.length <= 0)
            throw new Error("SyncLyrics: You must provide atleast one source");
        this.lyrics = null;
        this._cache = null;
        this._lyricsSource = null;
        this._fetching = false;
        this._fetchingTrackId = null;
        this._fetchingSource = null;
        this._trackId = null;
        this._fetchLyricsMusixmatch = this._fetchLyricsMusixmatch.bind(this);
        this._fetchLyricsNetease = this._fetchLyricsNetease.bind(this);
        this._getLyrics = this._getLyrics.bind(this);
        this._parseNeteaseLyrics = this._parseNeteaseLyrics.bind(this);
        this._searchLyricsMusixmatch = this._searchLyricsMusixmatch.bind(this);
        this._searchLyricsNetease = this._searchLyricsNetease.bind(this);
        this.debugLog = this.debugLog.bind(this);
        this.errorLog = this.errorLog.bind(this);
        this.fetchLyricsLrclib = this.fetchLyricsLrclib.bind(this);
        this.fetchLyricsMusixmatch = this.fetchLyricsMusixmatch.bind(this);
        this.fetchLyricsNetease = this.fetchLyricsNetease.bind(this);
        this.getLyrics = this.getLyrics.bind(this);
        this.getMusixmatchUsertoken = this.getMusixmatchUsertoken.bind(this);
        this.infoLog = this.infoLog.bind(this);
        this.parseLyrics = this.parseLyrics.bind(this);
        this.warnLog = this.warnLog.bind(this);
    }
    _fetchLyricsMusixmatch(metadata, commonTrackId, tokenData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            if (!metadata || !commonTrackId || !tokenData)
                return null;
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
            const searchParams = new URLSearchParams({
                app_id: "web-desktop-app-v1.0",
                usertoken: tokenData.usertoken,
                commontrack_id: commonTrackId,
            });
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get?${searchParams}`;
            try {
                this.debugLog("Musixmatch lyrics fetch URL:", url);
                const res = yield fetch(url, {
                    // @ts-ignore
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Lyrics]`);
                    if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                        ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                const data = yield res.json();
                if (((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.status_code) === 401 &&
                    ((_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.header) === null || _f === void 0 ? void 0 : _f.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Lyrics]");
                    if ((!this._cache || !((_g = this._cache) === null || _g === void 0 ? void 0 : _g.lyrics)) &&
                        ((_h = this._cache) === null || _h === void 0 ? void 0 : _h.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                this.debugLog("Musixmatch track data:", (_j = data === null || data === void 0 ? void 0 : data.message) === null || _j === void 0 ? void 0 : _j.body);
                const lyrics = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.message) === null || _k === void 0 ? void 0 : _k.body) === null || _l === void 0 ? void 0 : _l.subtitle) === null || _m === void 0 ? void 0 : _m.subtitle_body;
                if (!lyrics) {
                    this.infoLog("Missing Lyrics [Musixmatch - Lyrics]");
                    if ((!this._cache || !((_o = this._cache) === null || _o === void 0 ? void 0 : _o.lyrics)) &&
                        ((_p = this._cache) === null || _p === void 0 ? void 0 : _p.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                this.infoLog("Successfully fetched and cached the synced lyrics [Musixmatch]");
                cacheData.lyrics = lyrics;
                this._lyricsSource = "Musixmatch";
                this._cache = cacheData;
                return lyrics;
            }
            catch (e) {
                if ((!this._cache || !((_q = this._cache) === null || _q === void 0 ? void 0 : _q.lyrics)) &&
                    ((_r = this._cache) === null || _r === void 0 ? void 0 : _r.trackId) !== this._trackId)
                    this._cache = cacheData;
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Lyrics]", e);
                return null;
            }
        });
    }
    _fetchLyricsNetease(metadata, trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (!metadata || !trackId)
                return null;
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
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
                    if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                        ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                const data = yield res.json();
                this.debugLog("Netease track data:", data);
                let lyrics = (_c = data === null || data === void 0 ? void 0 : data.lrc) === null || _c === void 0 ? void 0 : _c.lyric;
                if (!lyrics) {
                    this.infoLog("Missing Lyrics [Netease - Lyrics]");
                    if ((!this._cache || !((_d = this._cache) === null || _d === void 0 ? void 0 : _d.lyrics)) &&
                        ((_e = this._cache) === null || _e === void 0 ? void 0 : _e.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                lyrics = this._parseNeteaseLyrics(lyrics);
                this.infoLog("Successfully fetched and cached the synced lyrics [Netease]");
                cacheData.lyrics = lyrics;
                this._lyricsSource = "Netease";
                this._cache = cacheData;
                return lyrics;
            }
            catch (e) {
                if ((!this._cache || !((_f = this._cache) === null || _f === void 0 ? void 0 : _f.lyrics)) &&
                    ((_g = this._cache) === null || _g === void 0 ? void 0 : _g.trackId) !== this._trackId)
                    this._cache = cacheData;
                this.errorLog("Something went wrong while fetching the lyrics [Netease - Lyrics]", e);
                return null;
            }
        });
    }
    _getLyrics(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._fetching && this._fetchingTrackId === this._trackId) {
                this.warnLog(`Already fetching from the source "${this._fetchingSource}" (Track ID: "${this._fetchingTrackId}")`);
                return null;
            }
            const avaibleSources = {
                musixmatch: this.fetchLyricsMusixmatch,
                lrclib: this.fetchLyricsLrclib,
                netease: this.fetchLyricsNetease,
            };
            let sources = this.sources || ["musixmatch", "lrclib", "netease"];
            if (sources.every((source) => !Object.keys(avaibleSources).includes(source)))
                sources = ["musixmatch", "lrclib", "netease"];
            for (const source of sources) {
                this.infoLog(`Trying to fetch the lyrics from the source "${source}"`);
                if (!Object.keys(avaibleSources).includes(source)) {
                    this.infoLog(`The source "${source}" doesn't exist, skipping...`);
                    continue;
                }
                this._fetching = true;
                this._fetchingSource = source;
                this._fetchingTrackId = this._trackId;
                const lyrics = yield avaibleSources[source](metadata);
                if (lyrics) {
                    this.infoLog(`Got lyrics from the source "${source}"`);
                    this._fetching = false;
                    this._fetchingSource = null;
                    this._fetchingTrackId = null;
                    return lyrics;
                }
                this.infoLog(`The source "${source}" doesn't have the lyrics, skipping...`);
            }
            this.infoLog("None of the sources have the lyrics");
            return null;
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
    _searchLyricsMusixmatch(metadata, tokenData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            if (!metadata || !tokenData)
                return null;
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
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
                f_has_subtitle: 1,
                q_duration: duration || "",
                f_subtitle_length: Math.floor(duration) || "",
            });
            const url = `https://apic-desktop.musixmatch.com/ws/1.1/track.search?${searchParams}`;
            try {
                this.debugLog("Musixmatch search fetch URL:", url);
                const res = yield fetch(url, {
                    // @ts-ignore
                    headers: {
                        cookie: tokenData.cookies,
                    },
                });
                if (!res.ok) {
                    this.warnLog(`Lyrics fetch request failed with status ${res.status} (${res.statusText}) [Musixmatch - Search]`);
                    if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                        ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                const data = yield res.json();
                if (((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.status_code) === 401 &&
                    ((_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.header) === null || _f === void 0 ? void 0 : _f.hint) === "captcha") {
                    this.warnLog("The usertoken has been temporary blocked for too many requests (captcha) [Musixmatch - Search]");
                    if ((!this._cache || !((_g = this._cache) === null || _g === void 0 ? void 0 : _g.lyrics)) &&
                        ((_h = this._cache) === null || _h === void 0 ? void 0 : _h.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                this.debugLog("Musixmatch search results:", (_k = (_j = data === null || data === void 0 ? void 0 : data.message) === null || _j === void 0 ? void 0 : _j.body) === null || _k === void 0 ? void 0 : _k.track_list);
                if (((_o = (_m = (_l = data === null || data === void 0 ? void 0 : data.message) === null || _l === void 0 ? void 0 : _l.body) === null || _m === void 0 ? void 0 : _m.track_list) === null || _o === void 0 ? void 0 : _o.length) <= 0) {
                    if ((!this._cache || !((_p = this._cache) === null || _p === void 0 ? void 0 : _p.lyrics)) &&
                        ((_q = this._cache) === null || _q === void 0 ? void 0 : _q.trackId) !== this._trackId)
                        this._cache = cacheData;
                    this.infoLog("No songs were found [Musixmatch - Search]");
                    return null;
                }
                const track = (_t = (_s = (_r = data === null || data === void 0 ? void 0 : data.message) === null || _r === void 0 ? void 0 : _r.body) === null || _s === void 0 ? void 0 : _s.track_list) === null || _t === void 0 ? void 0 : _t.find((listItem) => {
                    var _a, _b, _c, _d;
                    return ((_a = listItem.track.track_name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ===
                        ((_b = metadata.track) === null || _b === void 0 ? void 0 : _b.toLowerCase()) &&
                        ((_c = listItem.track.artist_name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes((_d = metadata.artist) === null || _d === void 0 ? void 0 : _d.toLowerCase()));
                });
                this.debugLog("Musixmatch search filtered track:", track);
                if (!track) {
                    if ((!this._cache || !((_u = this._cache) === null || _u === void 0 ? void 0 : _u.lyrics)) &&
                        ((_v = this._cache) === null || _v === void 0 ? void 0 : _v.trackId) !== this._trackId)
                        this._cache = cacheData;
                    this.infoLog("No songs were found with the current name and artist [Musixmatch - Search]");
                    return null;
                }
                const commonTrackId = (_w = track === null || track === void 0 ? void 0 : track.track) === null || _w === void 0 ? void 0 : _w.commontrack_id;
                this.debugLog("Musixmatch commontrack_id", commonTrackId);
                return commonTrackId;
            }
            catch (e) {
                if ((!this._cache || !((_x = this._cache) === null || _x === void 0 ? void 0 : _x.lyrics)) &&
                    ((_y = this._cache) === null || _y === void 0 ? void 0 : _y.trackId) !== this._trackId)
                    this._cache = cacheData;
                this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Search]", e);
                return null;
            }
        });
    }
    _searchLyricsNetease(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            // @ts-ignore
            const searchParams = new URLSearchParams({
                limit: 10,
                type: 1,
                keywords: `${metadata.track} ${metadata.artist}`,
            });
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
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
                    if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                        ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                        this._cache = cacheData;
                    return null;
                }
                const data = yield res.json();
                if (!((_c = data === null || data === void 0 ? void 0 : data.result) === null || _c === void 0 ? void 0 : _c.songs) || ((_e = (_d = data === null || data === void 0 ? void 0 : data.result) === null || _d === void 0 ? void 0 : _d.songs) === null || _e === void 0 ? void 0 : _e.length) <= 0) {
                    if ((!this._cache || !((_f = this._cache) === null || _f === void 0 ? void 0 : _f.lyrics)) &&
                        ((_g = this._cache) === null || _g === void 0 ? void 0 : _g.trackId) !== this._trackId)
                        this._cache = cacheData;
                    this.infoLog("No songs were found [Netease - Search]");
                    return null;
                }
                const track = (_j = (_h = data === null || data === void 0 ? void 0 : data.result) === null || _h === void 0 ? void 0 : _h.songs) === null || _j === void 0 ? void 0 : _j.find((listItem) => {
                    var _a, _b;
                    return ((_a = listItem.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = metadata.track) === null || _b === void 0 ? void 0 : _b.toLowerCase()) &&
                        // listItem.album?.name?.toLowerCase() === metadata.album?.toLowerCase() &&
                        listItem.artists.some((artist) => {
                            var _a, _b, _c;
                            return (_b = (_a = artist.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes((_c = metadata.artist) === null || _c === void 0 ? void 0 : _c.toLowerCase());
                        });
                });
                this.debugLog("Netease search filtered track:", track);
                if (!track) {
                    if ((!this._cache || !((_k = this._cache) === null || _k === void 0 ? void 0 : _k.lyrics)) &&
                        ((_l = this._cache) === null || _l === void 0 ? void 0 : _l.trackId) !== this._trackId)
                        this._cache = cacheData;
                    this.infoLog("No songs were found with the current name and artist [Netease - Search]");
                    return null;
                }
                const trackId = track.id;
                this.debugLog("Neteasw track ID", trackId);
                return trackId;
            }
            catch (e) {
                if ((!this._cache || !((_m = this._cache) === null || _m === void 0 ? void 0 : _m.lyrics)) &&
                    ((_o = this._cache) === null || _o === void 0 ? void 0 : _o.trackId) !== this._trackId)
                    this._cache = cacheData;
                this.errorLog("Something went wrong while fetching the lyrics [Netease - Search]", e);
                return null;
            }
        });
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
    fetchLyricsLrclib(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!metadata)
                return;
            this.infoLog(`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [LRCLIB]`);
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
            // @ts-ignore
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
                    this._cache = cacheData;
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
                if (!match || !match.syncedLyrics || ((_a = match.syncedLyrics) === null || _a === void 0 ? void 0 : _a.length) <= 0) {
                    this.infoLog("The fetched song does not have synced lyrics [LRCLIB]");
                    this._cache = cacheData;
                    return null;
                }
                this.infoLog("Successfully fetched and cached the synced lyrics [LRCLIB]");
                cacheData.lyrics = match.syncedLyrics;
                this._cache = cacheData;
                this._lyricsSource = "lrclib.net";
                return match.syncedLyrics;
            }
            catch (e) {
                this._cache = cacheData;
                this.errorLog("Something went wrong while fetching the lyrics [LRCLIB]", e);
                return null;
            }
        });
    }
    fetchLyricsMusixmatch(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!metadata)
                return;
            const tokenData = yield this.getMusixmatchUsertoken();
            this.debugLog("Musixmatch token data:", tokenData);
            if (!tokenData)
                return null;
            this.infoLog(`Fetching the lyrics for "${metadata.track}" from "${metadata.album}" from "${metadata.artist}" (${this._trackId}) [Musixmatch]`);
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
            const commonTrackId = yield this._searchLyricsMusixmatch(metadata, tokenData);
            if (!commonTrackId) {
                this.infoLog("Missing commontrack_id [Musixmatch - Search]");
                if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                    ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                    this._cache = cacheData;
                return null;
            }
            const lyrics = yield this._fetchLyricsMusixmatch(metadata, commonTrackId, tokenData);
            return lyrics;
        });
    }
    fetchLyricsNetease(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!metadata)
                return;
            const cacheData = {
                trackId: this._trackId,
                lyrics: null,
            };
            const trackId = yield this._searchLyricsNetease(metadata);
            if (!trackId) {
                this.infoLog("Missing track ID [Netease - Search]");
                if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                    ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                    this._cache = cacheData;
                return null;
            }
            const lyrics = yield this._fetchLyricsNetease(metadata, trackId);
            return lyrics;
        });
    }
    getLyrics(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            this._trackId = Buffer.from(`${metadata.track || ""}-${metadata.artist || ""}-${metadata.album || ""}`).toString("base64");
            if (!this._cache) {
                this.infoLog("No cached lyrics, fetching the song data");
                this.lyrics = yield this._getLyrics(metadata);
                return {
                    trackId: this._trackId,
                    lyrics: this.lyrics,
                    track: metadata.track,
                    artist: metadata.artist,
                    album: metadata.album,
                    source: this._lyricsSource,
                    cached: false,
                    parse: this.parseLyrics
                };
            }
            if (this._trackId !== this._cache.trackId) {
                this.infoLog("Cached song is different from current song, fetching the song data");
                this._cache = null;
                this.lyrics = yield this._getLyrics(metadata);
                return {
                    trackId: this._trackId,
                    lyrics: this.lyrics,
                    track: metadata.track,
                    artist: metadata.artist,
                    album: metadata.album,
                    source: this._lyricsSource,
                    cached: false,
                    parse: this.parseLyrics
                };
            }
            if (!this._cache.lyrics) {
                this.infoLog("Cached lyrics are null");
                return null;
            }
            this.lyrics = this._cache.lyrics;
            return {
                trackId: this._trackId,
                lyrics: this.lyrics,
                track: metadata.track,
                artist: metadata.artist,
                album: metadata.album,
                source: this._lyricsSource,
                cached: false,
                parse: this.parseLyrics
            };
        });
    }
    getMusixmatchUsertoken(cookies) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            this.infoLog("Getting Musixmatch token...");
            const data = yield this.getMusixmatchToken();
            if (data)
                return data;
            // const tokenFile = path.join("/", "tmp", "musixmatchToken.json");
            // if (fs.existsSync(tokenFile)) {
            // 	this.infoLog("Token file found, checking if it is valid...");
            // 	const fileContent = fs.readFileSync(tokenFile);
            // 	try {
            // 		// @ts-ignore
            // 		const data = JSON.parse(fileContent);
            // 		this.infoLog(
            // 			"Token file is valid, checking if the token is not expired and has all the required fields...",
            // 		);
            // 		if (data.usertoken && data.cookies && data.expiresAt > Date.now()) {
            // 			this.infoLog("Got token from the token file");
            // 			return data;
            // 		}
            // 	} catch (e) {
            // 		this.errorLog(
            // 			"Something went wrong while reading the token file, deleting it...",
            // 			e,
            // 		);
            // 		try {
            // 			fs.unlinkSync(tokenFile);
            // 		} catch (e) {
            // 			this.errorLog(
            // 				"Something went wrong while deleting the token file...",
            // 				e,
            // 			);
            // 		}
            // 	}
            // }
            // if (global.fetchingMxmToken) return null;
            this.infoLog("Fetching the token from the API...");
            const url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?user_language=en&app_id=web-desktop-app-v1.0";
            try {
                const res = yield fetch(url, {
                    redirect: "manual",
                    // @ts-ignore
                    headers: {
                        cookie: cookies,
                    },
                });
                if (res.status === 301) {
                    this.debugLog("Successfully received the 'set-cookie' redirect response");
                    const setCookie = res.headers
                        .getSetCookie()
                        .map((cookie) => cookie.split(";").shift())
                        // @ts-ignore
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
                    yield sleep(10000); // wait 10 seconds
                    this.infoLog("Retrying to fetch the Musixmatch usertken...");
                    // global.fetchingMxmToken = false;
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
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000).getTime(), // 10 minutes
                };
                yield this.saveMusixmatchToken(json);
                // global.fetchingMxmToken = false;
                this.infoLog("Successfully fetched the usertoken");
                return json;
            }
            catch (e) { }
        });
    }
    infoLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.info)
            return;
        console.info("\x1b[34;1mINFO:\x1b[0m", ...args);
    }
    parseLyrics(lyrics = this.lyrics) {
        const lyricsSplit = lyrics === null || lyrics === void 0 ? void 0 : lyrics.split("\n");
        if (!lyricsSplit)
            return null;
        const formattedLyrics = [];
        let lastTime;
        for (const index in lyricsSplit) {
            const lyricText = lyricsSplit[index].split(" ");
            // @ts-ignore
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
    warnLog(...args) {
        if ((logLevels[this.logLevel] || 0) < logLevels.warn)
            return;
        console.warn("\x1b[33;1mWARNING:\x1b[0m", ...args);
    }
    _getMusixmatchToken() {
        const tokenFile = node_path_1.default.join("/", "tmp", "musixmatchToken.json");
        if (node_fs_1.default.existsSync(tokenFile)) {
            this.infoLog("Token file found, checking if it is valid...");
            const fileContent = node_fs_1.default.readFileSync(tokenFile);
            try {
                // @ts-ignore
                const data = JSON.parse(fileContent);
                this.infoLog("Token file is valid, checking if the token is not expired and has all the required fields...");
                if (data.usertoken && data.cookies && data.expiresAt > Date.now()) {
                    this.infoLog("Got token from the token file");
                    return data;
                }
            }
            catch (e) {
                this.errorLog("Something went wrong while reading the token file, deleting it...", e);
                try {
                    node_fs_1.default.unlinkSync(tokenFile);
                }
                catch (e) {
                    this.errorLog("Something went wrong while deleting the token file...", e);
                }
            }
            return null;
        }
    }
    _saveMusixmatchToken(tokenData) {
        const tokenFile = node_path_1.default.join("/", "tmp", "musixmatchToken.json");
        node_fs_1.default.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 4));
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

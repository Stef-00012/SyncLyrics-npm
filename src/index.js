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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_path_1 = require("node:path");
var node_fs_1 = require("node:fs");
var node_util_1 = require("node:util");
var sleep = (0, node_util_1.promisify)(setTimeout);
var logLevels = {
    debug: 4,
    error: 3,
    warn: 2,
    info: 1,
    none: 0,
};
var SyncLyrics = /** @class */ (function () {
    function SyncLyrics(data) {
        this.logLevel = (data === null || data === void 0 ? void 0 : data.logLevel) || "none";
        this.instrumentalLyricsIndicator = (data === null || data === void 0 ? void 0 : data.instrumentalLyricsIndicator) || "";
        this.sources = (data === null || data === void 0 ? void 0 : data.sources) || ["musixmatch", "lrclib", "netease"];
        if (this.sources.length <= 0)
            throw new Error("SyncLyrics: You must provide atleast one source");
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
    SyncLyrics.prototype._fetchLyricsMusixmatch = function (metadata, commonTrackId, tokenData) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData, searchParams, url, res, data, lyrics, e_1;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        if (!metadata || !commonTrackId || !tokenData)
                            return [2 /*return*/, null];
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        searchParams = new URLSearchParams({
                            app_id: "web-desktop-app-v1.0",
                            usertoken: tokenData.usertoken,
                            commontrack_id: commonTrackId,
                        });
                        url = "https://apic-desktop.musixmatch.com/ws/1.1/track.subtitle.get?".concat(searchParams);
                        _s.label = 1;
                    case 1:
                        _s.trys.push([1, 4, , 5]);
                        this.debugLog("Musixmatch lyrics fetch URL:", url);
                        return [4 /*yield*/, fetch(url, {
                                // @ts-ignore
                                headers: {
                                    cookie: tokenData.cookies,
                                },
                            })];
                    case 2:
                        res = _s.sent();
                        if (!res.ok) {
                            this.warnLog("Lyrics fetch request failed with status ".concat(res.status, " (").concat(res.statusText, ") [Musixmatch - Lyrics]"));
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _s.sent();
                        if (((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.status_code) === 401 &&
                            ((_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.header) === null || _f === void 0 ? void 0 : _f.hint) === "captcha") {
                            this.warnLog("The usertoken has been temporary blocked for too many requests (captcha)... [Musixmatch - Lyrics]");
                            if ((!this._cache || !((_g = this._cache) === null || _g === void 0 ? void 0 : _g.lyrics)) &&
                                ((_h = this._cache) === null || _h === void 0 ? void 0 : _h.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        this.debugLog("Musixmatch track data:", (_j = data === null || data === void 0 ? void 0 : data.message) === null || _j === void 0 ? void 0 : _j.body);
                        lyrics = (_m = (_l = (_k = data === null || data === void 0 ? void 0 : data.message) === null || _k === void 0 ? void 0 : _k.body) === null || _l === void 0 ? void 0 : _l.subtitle) === null || _m === void 0 ? void 0 : _m.subtitle_body;
                        if (!lyrics) {
                            this.infoLog("Missing Lyrics [Musixmatch - Lyrics]");
                            if ((!this._cache || !((_o = this._cache) === null || _o === void 0 ? void 0 : _o.lyrics)) &&
                                ((_p = this._cache) === null || _p === void 0 ? void 0 : _p.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        this.infoLog("Successfully fetched and cached the synced lyrics [Musixmatch]");
                        cacheData.lyrics = lyrics;
                        this._lyricsSource = "Musixmatch";
                        this._cache = cacheData;
                        return [2 /*return*/, lyrics];
                    case 4:
                        e_1 = _s.sent();
                        if ((!this._cache || !((_q = this._cache) === null || _q === void 0 ? void 0 : _q.lyrics)) &&
                            ((_r = this._cache) === null || _r === void 0 ? void 0 : _r.trackId) !== this._trackId)
                            this._cache = cacheData;
                        this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Lyrics]", e_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype._fetchLyricsNetease = function (metadata, trackId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData, searchParams, url, res, data, lyrics, e_2;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!metadata || !trackId)
                            return [2 /*return*/, null];
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        searchParams = new URLSearchParams({
                            id: trackId,
                        });
                        url = "https://music.xianqiao.wang/neteaseapiv2/lyric?".concat(searchParams);
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 4, , 5]);
                        this.debugLog("Netease lyrics fetch URL:", url);
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                                },
                            })];
                    case 2:
                        res = _h.sent();
                        if (!res.ok) {
                            this.warnLog("Lyrics fetch request failed with status ".concat(res.status, " (").concat(res.statusText, ") [Netease - Lyrics]"));
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _h.sent();
                        this.debugLog("Netease track data:", data);
                        lyrics = (_c = data === null || data === void 0 ? void 0 : data.lrc) === null || _c === void 0 ? void 0 : _c.lyric;
                        if (!lyrics) {
                            this.infoLog("Missing Lyrics [Netease - Lyrics]");
                            if ((!this._cache || !((_d = this._cache) === null || _d === void 0 ? void 0 : _d.lyrics)) &&
                                ((_e = this._cache) === null || _e === void 0 ? void 0 : _e.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        lyrics = this._parseNeteaseLyrics(lyrics);
                        this.infoLog("Successfully fetched and cached the synced lyrics [Netease]");
                        cacheData.lyrics = lyrics;
                        this._lyricsSource = "Netease";
                        this._cache = cacheData;
                        return [2 /*return*/, lyrics];
                    case 4:
                        e_2 = _h.sent();
                        if ((!this._cache || !((_f = this._cache) === null || _f === void 0 ? void 0 : _f.lyrics)) &&
                            ((_g = this._cache) === null || _g === void 0 ? void 0 : _g.trackId) !== this._trackId)
                            this._cache = cacheData;
                        this.errorLog("Something went wrong while fetching the lyrics [Netease - Lyrics]", e_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype._getLyrics = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var avaibleSources, sources, _i, sources_1, source, lyrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._fetching && this._fetchingTrackId === this._trackId) {
                            this.warnLog("Already fetching from the source \"".concat(this._fetchingSource, "\" (Track ID: \"").concat(this._fetchingTrackId, "\")"));
                            return [2 /*return*/, null];
                        }
                        avaibleSources = {
                            musixmatch: this.fetchLyricsMusixmatch,
                            lrclib: this.fetchLyricsLrclib,
                            netease: this.fetchLyricsNetease,
                        };
                        sources = this.sources || ["musixmatch", "lrclib", "netease"];
                        if (sources.every(function (source) { return !Object.keys(avaibleSources).includes(source); }))
                            sources = ["musixmatch", "lrclib", "netease"];
                        _i = 0, sources_1 = sources;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sources_1.length)) return [3 /*break*/, 4];
                        source = sources_1[_i];
                        this.infoLog("Trying to fetch the lyrics from the source \"".concat(source, "\""));
                        if (!Object.keys(avaibleSources).includes(source)) {
                            this.infoLog("The source \"".concat(source, "\" doesn't exist, skipping..."));
                            return [3 /*break*/, 3];
                        }
                        this._fetching = true;
                        this._fetchingSource = source;
                        this._fetchingTrackId = this._trackId;
                        return [4 /*yield*/, avaibleSources[source](metadata)];
                    case 2:
                        lyrics = _a.sent();
                        if (lyrics) {
                            this.infoLog("Got lyrics from the source \"".concat(source, "\""));
                            this._fetching = false;
                            this._fetchingSource = null;
                            this._fetchingTrackId = null;
                            return [2 /*return*/, lyrics];
                        }
                        this.infoLog("The source \"".concat(source, "\" doesn't have the lyrics, skipping..."));
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.infoLog("None of the sources have the lyrics");
                        return [2 /*return*/, null];
                }
            });
        });
    };
    SyncLyrics.prototype._parseNeteaseLyrics = function (slyrics) {
        var lines = slyrics.split(/\r?\n/).map(function (line) { return line.trim(); });
        var lyrics = [];
        var creditInfo = [
            "\\s?作?\\s*词|\\s?作?\\s*曲|\\s?编\\s*曲?|\\s?监\\s*制?",
            ".*编写|.*和音|.*和声|.*合声|.*提琴|.*录|.*工程|.*工作室|.*设计|.*剪辑|.*制作|.*发行|.*出品|.*后期|.*混音|.*缩混",
            "原唱|翻唱|题字|文案|海报|古筝|二胡|钢琴|吉他|贝斯|笛子|鼓|弦乐| 人声 ",
            "lrc|publish|vocal|guitar|program|produce|write|mix",
        ];
        var creditInfoRegExp = new RegExp("^(".concat(creditInfo.join("|"), ").*(:|\uFF1A)"), "i");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var matchResult = line.match(/(\[.*?\])|([^\[\]]+)/g);
            if (!matchResult || matchResult.length === 1) {
                continue;
            }
            var textIndex = -1;
            for (var j = 0; j < matchResult.length; j++) {
                if (!matchResult[j].endsWith("]")) {
                    textIndex = j;
                    break;
                }
            }
            var text = "";
            if (textIndex > -1) {
                text = matchResult.splice(textIndex, 1)[0];
                text = text.charAt(0).toUpperCase() + normalize(text.slice(1));
            }
            var time = matchResult[0];
            if (!creditInfoRegExp.test(text)) {
                lyrics.push("".concat(time, " ").concat(text || ""));
            }
        }
        return lyrics.join("\n");
    };
    SyncLyrics.prototype._searchLyricsMusixmatch = function (metadata, tokenData) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData, duration, searchParams, url, res, data, track, commonTrackId, e_3;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            return __generator(this, function (_z) {
                switch (_z.label) {
                    case 0:
                        if (!metadata || !tokenData)
                            return [2 /*return*/, null];
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        duration = Number.parseFloat(metadata.length) / 1000;
                        searchParams = new URLSearchParams({
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
                        url = "https://apic-desktop.musixmatch.com/ws/1.1/track.search?".concat(searchParams);
                        _z.label = 1;
                    case 1:
                        _z.trys.push([1, 4, , 5]);
                        this.debugLog("Musixmatch search fetch URL:", url);
                        return [4 /*yield*/, fetch(url, {
                                // @ts-ignore
                                headers: {
                                    cookie: tokenData.cookies,
                                },
                            })];
                    case 2:
                        res = _z.sent();
                        if (!res.ok) {
                            this.warnLog("Lyrics fetch request failed with status ".concat(res.status, " (").concat(res.statusText, ") [Musixmatch - Search]"));
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _z.sent();
                        if (((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.status_code) === 401 &&
                            ((_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.header) === null || _f === void 0 ? void 0 : _f.hint) === "captcha") {
                            this.warnLog("The usertoken has been temporary blocked for too many requests (captcha) [Musixmatch - Search]");
                            if ((!this._cache || !((_g = this._cache) === null || _g === void 0 ? void 0 : _g.lyrics)) &&
                                ((_h = this._cache) === null || _h === void 0 ? void 0 : _h.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        this.debugLog("Musixmatch search results:", (_k = (_j = data === null || data === void 0 ? void 0 : data.message) === null || _j === void 0 ? void 0 : _j.body) === null || _k === void 0 ? void 0 : _k.track_list);
                        if (((_o = (_m = (_l = data === null || data === void 0 ? void 0 : data.message) === null || _l === void 0 ? void 0 : _l.body) === null || _m === void 0 ? void 0 : _m.track_list) === null || _o === void 0 ? void 0 : _o.length) <= 0) {
                            if ((!this._cache || !((_p = this._cache) === null || _p === void 0 ? void 0 : _p.lyrics)) &&
                                ((_q = this._cache) === null || _q === void 0 ? void 0 : _q.trackId) !== this._trackId)
                                this._cache = cacheData;
                            this.infoLog("No songs were found [Musixmatch - Search]");
                            return [2 /*return*/, null];
                        }
                        track = (_t = (_s = (_r = data === null || data === void 0 ? void 0 : data.message) === null || _r === void 0 ? void 0 : _r.body) === null || _s === void 0 ? void 0 : _s.track_list) === null || _t === void 0 ? void 0 : _t.find(function (listItem) {
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
                            return [2 /*return*/, null];
                        }
                        commonTrackId = (_w = track === null || track === void 0 ? void 0 : track.track) === null || _w === void 0 ? void 0 : _w.commontrack_id;
                        this.debugLog("Musixmatch commontrack_id", commonTrackId);
                        return [2 /*return*/, commonTrackId];
                    case 4:
                        e_3 = _z.sent();
                        if ((!this._cache || !((_x = this._cache) === null || _x === void 0 ? void 0 : _x.lyrics)) &&
                            ((_y = this._cache) === null || _y === void 0 ? void 0 : _y.trackId) !== this._trackId)
                            this._cache = cacheData;
                        this.errorLog("Something went wrong while fetching the lyrics [Musixmatch - Search]", e_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype._searchLyricsNetease = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, cacheData, url, res, data, track, trackId, e_4;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        searchParams = new URLSearchParams({
                            limit: 10,
                            type: 1,
                            keywords: "".concat(metadata.track, " ").concat(metadata.artist),
                        });
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        url = "https://music.xianqiao.wang/neteaseapiv2/search?".concat(searchParams);
                        _p.label = 1;
                    case 1:
                        _p.trys.push([1, 4, , 5]);
                        this.debugLog("Netease search fetch URL:", url);
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                                },
                            })];
                    case 2:
                        res = _p.sent();
                        if (!res.ok) {
                            this.warnLog("Lyrics fetch request failed with status ".concat(res.status, " (").concat(res.statusText, ") [Netease - Search]"));
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _p.sent();
                        if (!((_c = data === null || data === void 0 ? void 0 : data.result) === null || _c === void 0 ? void 0 : _c.songs) || ((_e = (_d = data === null || data === void 0 ? void 0 : data.result) === null || _d === void 0 ? void 0 : _d.songs) === null || _e === void 0 ? void 0 : _e.length) <= 0) {
                            if ((!this._cache || !((_f = this._cache) === null || _f === void 0 ? void 0 : _f.lyrics)) &&
                                ((_g = this._cache) === null || _g === void 0 ? void 0 : _g.trackId) !== this._trackId)
                                this._cache = cacheData;
                            this.infoLog("No songs were found [Netease - Search]");
                            return [2 /*return*/, null];
                        }
                        track = (_j = (_h = data === null || data === void 0 ? void 0 : data.result) === null || _h === void 0 ? void 0 : _h.songs) === null || _j === void 0 ? void 0 : _j.find(function (listItem) {
                            var _a, _b;
                            return ((_a = listItem.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = metadata.track) === null || _b === void 0 ? void 0 : _b.toLowerCase()) &&
                                // listItem.album?.name?.toLowerCase() === metadata.album?.toLowerCase() &&
                                listItem.artists.some(function (artist) {
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
                            return [2 /*return*/, null];
                        }
                        trackId = track.id;
                        this.debugLog("Neteasw track ID", trackId);
                        return [2 /*return*/, trackId];
                    case 4:
                        e_4 = _p.sent();
                        if ((!this._cache || !((_m = this._cache) === null || _m === void 0 ? void 0 : _m.lyrics)) &&
                            ((_o = this._cache) === null || _o === void 0 ? void 0 : _o.trackId) !== this._trackId)
                            this._cache = cacheData;
                        this.errorLog("Something went wrong while fetching the lyrics [Netease - Search]", e_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype.debugLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if ((logLevels[this.logLevel] || 0) < logLevels.debug)
            return;
        console.debug.apply(console, __spreadArray(["\x1b[35;1mDEBUG:\x1b[0m"], args, false));
    };
    SyncLyrics.prototype.errorLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if ((logLevels[this.logLevel] || 0) < logLevels.debug)
            return;
        console.debug.apply(console, __spreadArray(["\x1b[35;1mDEBUG:\x1b[0m"], args, false));
    };
    SyncLyrics.prototype.fetchLyricsLrclib = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData, searchParams, url, res, data, match, e_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!metadata)
                            return [2 /*return*/];
                        this.infoLog("Fetching the lyrics for \"".concat(metadata.track, "\" from \"").concat(metadata.album, "\" from \"").concat(metadata.artist, "\" (").concat(this._trackId, ") [LRCLIB]"));
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        searchParams = new URLSearchParams({
                            track_name: metadata.track,
                            artist_name: metadata.artist,
                            album_name: metadata.album,
                            q: metadata.track,
                        });
                        url = "https://lrclib.net/api/search?".concat(searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    "Lrclib-Client": "SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
                                    "User-Agent": "SyncLyrics (https://github.com/Stef-00012/SyncLyrics)",
                                },
                            })];
                    case 2:
                        res = _b.sent();
                        if (!res.ok) {
                            this.warnLog("Lyrics fetch request failed with status ".concat(res.status, " (").concat(res.statusText, ") [LRCLIB]"));
                            this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _b.sent();
                        this.debugLog("lrclib.net results:", data);
                        match = data.find(function (d) {
                            var _a, _b, _c, _d;
                            return ((_a = d.artistName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes((_b = metadata.artist) === null || _b === void 0 ? void 0 : _b.toLowerCase())) &&
                                ((_c = d.trackName) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === ((_d = metadata.track) === null || _d === void 0 ? void 0 : _d.toLowerCase());
                        });
                        this.debugLog("lrclib filtered track:", match);
                        if (!match || !match.syncedLyrics || ((_a = match.syncedLyrics) === null || _a === void 0 ? void 0 : _a.length) <= 0) {
                            this.infoLog("The fetched song does not have synced lyrics [LRCLIB]");
                            this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        this.infoLog("Successfully fetched and cached the synced lyrics [LRCLIB]");
                        cacheData.lyrics = match.syncedLyrics;
                        this._cache = cacheData;
                        this._lyricsSource = "lrclib.net";
                        return [2 /*return*/, match.syncedLyrics];
                    case 4:
                        e_5 = _b.sent();
                        this._cache = cacheData;
                        this.errorLog("Something went wrong while fetching the lyrics [LRCLIB]", e_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype.fetchLyricsMusixmatch = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenData, cacheData, commonTrackId, lyrics;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!metadata)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getMusixmatchUsertoken()];
                    case 1:
                        tokenData = _c.sent();
                        this.debugLog("Musixmatch token data:", tokenData);
                        if (!tokenData)
                            return [2 /*return*/, null];
                        this.infoLog("Fetching the lyrics for \"".concat(metadata.track, "\" from \"").concat(metadata.album, "\" from \"").concat(metadata.artist, "\" (").concat(this._trackId, ") [Musixmatch]"));
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        return [4 /*yield*/, this._searchLyricsMusixmatch(metadata, tokenData)];
                    case 2:
                        commonTrackId = _c.sent();
                        if (!commonTrackId) {
                            this.infoLog("Missing commontrack_id [Musixmatch - Search]");
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this._fetchLyricsMusixmatch(metadata, commonTrackId, tokenData)];
                    case 3:
                        lyrics = _c.sent();
                        return [2 /*return*/, lyrics];
                }
            });
        });
    };
    SyncLyrics.prototype.fetchLyricsNetease = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheData, trackId, lyrics;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!metadata)
                            return [2 /*return*/];
                        cacheData = {
                            trackId: this._trackId,
                            lyrics: null,
                        };
                        return [4 /*yield*/, this._searchLyricsNetease(metadata)];
                    case 1:
                        trackId = _c.sent();
                        if (!trackId) {
                            this.infoLog("Missing track ID [Netease - Search]");
                            if ((!this._cache || !((_a = this._cache) === null || _a === void 0 ? void 0 : _a.lyrics)) &&
                                ((_b = this._cache) === null || _b === void 0 ? void 0 : _b.trackId) !== this._trackId)
                                this._cache = cacheData;
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this._fetchLyricsNetease(metadata, trackId)];
                    case 2:
                        lyrics = _c.sent();
                        return [2 /*return*/, lyrics];
                }
            });
        });
    };
    SyncLyrics.prototype.getLyrics = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._trackId = Buffer.from("".concat(metadata.track || "", "-").concat(metadata.artist || "", "-").concat(metadata.album || "")).toString("base64");
                        if (!!this._cache) return [3 /*break*/, 2];
                        this.infoLog("No cached lyrics, fetching the song data");
                        _a = {
                            trackId: this._trackId
                        };
                        return [4 /*yield*/, this._getLyrics(metadata)];
                    case 1: return [2 /*return*/, (_a.lyrics = _c.sent(),
                            _a.track = metadata.track,
                            _a.artist = metadata.artist,
                            _a.album = metadata.album,
                            _a.source = this._lyricsSource,
                            _a.cached = false,
                            _a)];
                    case 2:
                        if (!(this._trackId !== this._cache.trackId)) return [3 /*break*/, 4];
                        this.infoLog("Cached song is different from current song, fetching the song data");
                        this._cache = null;
                        _b = {
                            trackId: this._trackId
                        };
                        return [4 /*yield*/, this._getLyrics(metadata)];
                    case 3: return [2 /*return*/, (_b.lyrics = _c.sent(),
                            _b.track = metadata.track,
                            _b.artist = metadata.artist,
                            _b.album = metadata.album,
                            _b.source = this._lyricsSource,
                            _b.cached = false,
                            _b)];
                    case 4:
                        if (!this._cache.lyrics) {
                            this.infoLog("Cached lyrics are null");
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                trackId: this._trackId,
                                lyrics: this._cache.lyrics,
                                track: metadata.track,
                                artist: metadata.artist,
                                album: metadata.album,
                                source: this._lyricsSource,
                                cached: false,
                            }];
                }
            });
        });
    };
    SyncLyrics.prototype.getMusixmatchUsertoken = function (cookies) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenFile, fileContent, data, url, res, setCookie, data, usertoken, json, e_6;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        this.infoLog("Getting Musixmatch token...");
                        tokenFile = node_path_1.default.join("/", "tmp", "musixmatchToken.json");
                        if (node_fs_1.default.existsSync(tokenFile)) {
                            this.infoLog("Token file found, checking if it is valid...");
                            fileContent = node_fs_1.default.readFileSync(tokenFile);
                            try {
                                data = JSON.parse(fileContent);
                                this.infoLog("Token file is valid, checking if the token is not expired and has all the required fields...");
                                if (data.usertoken && data.cookies && data.expiresAt > Date.now()) {
                                    this.infoLog("Got token from the token file");
                                    return [2 /*return*/, data];
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
                        }
                        // if (global.fetchingMxmToken) return null;
                        this.infoLog("Fetching the token from the API...");
                        url = "https://apic-desktop.musixmatch.com/ws/1.1/token.get?user_language=en&app_id=web-desktop-app-v1.0";
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, fetch(url, {
                                redirect: "manual",
                                // @ts-ignore
                                headers: {
                                    cookie: cookies,
                                },
                            })];
                    case 2:
                        res = _g.sent();
                        if (!(res.status === 301)) return [3 /*break*/, 4];
                        this.debugLog("Successfully received the 'set-cookie' redirect response");
                        setCookie = res.headers
                            .getSetCookie()
                            .map(function (cookie) { return cookie.split(";").shift(); })
                            // @ts-ignore
                            .filter(function (cookie) { return cookie.split("=").pop() !== "unknown"; })
                            .join("; ");
                        this.debugLog("Re-fetching with the cookies...");
                        return [4 /*yield*/, this.getMusixmatchUsertoken(setCookie)];
                    case 3: return [2 /*return*/, _g.sent()];
                    case 4:
                        if (!res.ok) {
                            this.warnLog("The usertoken API request failed with the status ".concat(res.status, " (").concat(res.statusText, ")"));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, res.json()];
                    case 5:
                        data = _g.sent();
                        if (!(((_b = (_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.status_code) === 401 &&
                            ((_d = (_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.hint) === "captcha")) return [3 /*break*/, 8];
                        this.warnLog("Musixmatch usertoken endpoint is being ratelimited, retrying in 10 seconds...");
                        return [4 /*yield*/, sleep(10000)];
                    case 6:
                        _g.sent(); // wait 10 seconds
                        this.infoLog("Retrying to fetch the Musixmatch usertken...");
                        return [4 /*yield*/, this.getMusixmatchUsertoken(cookies)];
                    case 7: 
                    // global.fetchingMxmToken = false;
                    return [2 /*return*/, _g.sent()];
                    case 8:
                        usertoken = (_f = (_e = data === null || data === void 0 ? void 0 : data.message) === null || _e === void 0 ? void 0 : _e.body) === null || _f === void 0 ? void 0 : _f.user_token;
                        if (!usertoken) {
                            this.infoLog("The API response did not include the usertoken");
                            return [2 /*return*/, null];
                        }
                        json = {
                            cookies: cookies,
                            usertoken: usertoken,
                            expiresAt: new Date(Date.now() + 10 * 60 * 1000).getTime(), // 10 minutes
                        };
                        node_fs_1.default.writeFileSync(tokenFile, JSON.stringify(json, null, 4));
                        // global.fetchingMxmToken = false;
                        this.infoLog("Successfully fetched the usertoken");
                        return [2 /*return*/, json];
                    case 9:
                        e_6 = _g.sent();
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    SyncLyrics.prototype.infoLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if ((logLevels[this.logLevel] || 0) < logLevels.info)
            return;
        console.info.apply(console, __spreadArray(["\x1b[34;1mINFO:\x1b[0m"], args, false));
    };
    SyncLyrics.prototype.parseLyrics = function (lyrics) {
        var lyricsSplit = lyrics.split("\n");
        var formattedLyrics = [];
        var lastTime;
        for (var index in lyricsSplit) {
            var lyricText = lyricsSplit[index].split(" ");
            // @ts-ignore
            var time = lyricText.shift().replace(/[\[\]]/g, "");
            var text = lyricText.join(" ");
            var minutes = time.split(":")[0];
            var seconds = time.split(":")[1];
            var totalSeconds = Number.parseFloat(minutes) * 60 + Number.parseFloat(seconds);
            var instrumentalLyricIndicator = this.instrumentalLyricsIndicator || " ";
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
    };
    SyncLyrics.prototype.warnLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if ((logLevels[this.logLevel] || 0) < logLevels.warn)
            return;
        console.warn.apply(console, __spreadArray(["\x1b[33;1mWARNING:\x1b[0m"], args, false));
    };
    return SyncLyrics;
}());
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
module.exports = {
    SyncLyrics: SyncLyrics,
    normalize: normalize,
};

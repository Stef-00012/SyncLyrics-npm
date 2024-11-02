export type Sources = Array<"musixmatch" | "lrclib" | "netease">;
export type LogLevel = "none" | "info" | "warn" | "error" | "debug";
export interface TokenData {
    cookies: string | undefined;
    usertoken: string;
    expiresAt: number;
}
export interface Metadata {
    track?: string;
    album?: string;
    length?: number;
    artist?: string;
    trackId?: string;
}
export interface Cache<K, V> {
    get(key: K): V | undefined | null;
    set(key: K, value: V): void;
    has(key: K): boolean;
    [key: string]: any;
}
export interface Data {
    logLevel?: LogLevel;
    instrumentalLyricsIndicator?: string;
    sources?: Sources;
    cache?: Cache<string | null | undefined, CacheLyrics | null | undefined | null>;
    saveMusixmatchToken?: (tokenData: TokenData) => void;
    getMusixmatchToken?: () => TokenData | null | undefined;
}
export interface FormattedLyric {
    time: number;
    text: string;
}
export interface LineSyncedLyricsData {
    parse: (lyrics?: string | null | undefined) => FormattedLyric[] | null;
    source: string | null | undefined;
    lyrics: string | null | undefined;
}
export interface PlainLyricsData {
    source: string | null | undefined;
    lyrics: string | null | undefined;
}
export interface WordSyncedLyricsLine {
    character: string;
    time: number;
}
export interface WordSyncedLyrics {
    end: number;
    start: number;
    lyric: string;
    syncedLyric: Array<WordSyncedLyricsLine>;
}
export interface WordSyncedLyricsData {
    source: string | null | undefined;
    lyrics: Array<WordSyncedLyrics> | null | undefined;
}
export interface Lyrics {
    wordSynced: WordSyncedLyricsData;
    lineSynced: LineSyncedLyricsData;
    plain: PlainLyricsData;
}
export interface CacheLineSyncedLyricsData {
    source: string | null | undefined;
    lyrics: string | null | undefined;
}
export interface CacheLyrics {
    wordSynced: WordSyncedLyricsData;
    lineSynced: CacheLineSyncedLyricsData;
    plain: PlainLyricsData;
}
export interface LyricsOutput {
    artist: string | undefined;
    track: string | undefined;
    album: string | undefined;
    trackId: string;
    cached: boolean;
    lyrics: Lyrics;
}
export interface MusixmatchSearchResult {
    hasLineSyncedLyrics: boolean;
    hasWordSyncedLyrics: boolean;
    commonTrackId: string;
    hasLyrics: boolean;
    trackId: string;
}
export interface MusixmatchLyricsFetchResult {
    wordSynced: Array<WordSyncedLyrics> | null;
    lineSynced: string | null;
    plain: string | null;
}
export interface MusixmatchFetchResult {
    wordSynced?: Array<WordSyncedLyrics> | null;
    lineSynced?: string | null;
    plain?: string | null;
    source: "Musixmatch";
}
export interface LrcLibFetchResult {
    lineSynced: string | null;
    plain: string | null;
    source: "lrclib.net";
    wordSynced: null;
}
export interface NeteaseFetchResult {
    lineSynced: string | null;
    source: "Netease";
    wordSynced: null;
    plain: null;
}
export declare class SyncLyrics {
    logLevel: LogLevel;
    instrumentalLyricsIndicator: string;
    sources: Sources;
    cache: Cache<string | null | undefined, CacheLyrics | null | undefined | null>;
    saveMusixmatchToken: null | undefined | ((tokenData: TokenData) => void | Promise<void>);
    getMusixmatchToken: null | undefined | (() => TokenData | Promise<TokenData | null | undefined> | null | undefined);
    private lyrics;
    private _trackId;
    constructor(data?: Data);
    private getMusixmatchUsertoken;
    private _searchLyricsMusixmatch;
    private _fetchPlainLyricsMusixmatch;
    private _fetchLineSyncedLyricsMusixmatch;
    private _fetchWordSyncedLyricsMusixmatch;
    private _fetchLyricsMusixmatch;
    private _searchLyricsNetease;
    private _fetchLyricsNetease;
    private _parseNeteaseLyrics;
    private fetchLyricsLrclib;
    private fetchLyricsMusixmatch;
    private fetchLyricsNetease;
    private _getLyrics;
    getLyrics(metadata: Metadata, skipCache?: boolean): Promise<LyricsOutput>;
    parseLyrics(lyrics?: string | null | undefined): Array<FormattedLyric> | null;
    getTrackId(metadata: Metadata): string;
    setLogLevel(logLevel?: LogLevel): this;
    setInstrumentalLyricsIndicator(instrumentalLyricsIndicator?: string): this;
    setSources(sources?: Sources): this;
    setCache(cache?: Cache<string | null | undefined, CacheLyrics | null | undefined | null>): this;
    setSaveMusixmatchToken(saveMusixmatchToken?: (tokenData: TokenData) => void | Promise<void>): this;
    setGetMusixmatchToken(getMusixmatchToken?: () => TokenData | Promise<TokenData>): this;
    private warnLog;
    private debugLog;
    private errorLog;
    private infoLog;
}
export declare function normalize(string: string): string;

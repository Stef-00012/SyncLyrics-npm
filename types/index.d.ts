export type Sources = Array<"musixmatch" | "lrclib" | "netease">;
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
    lineSynced: LineSyncedLyricsData;
    plain: PlainLyricsData;
    wordSynced: WordSyncedLyricsData;
}
export interface CacheLineSyncedLyricsData {
    source: string | null | undefined;
    lyrics: string | null | undefined;
}
export interface CacheLyrics {
    lineSynced: CacheLineSyncedLyricsData;
    plain: PlainLyricsData;
    wordSynced: WordSyncedLyricsData;
}
export interface LyricsOutput {
    trackId: string;
    lyrics: Lyrics;
    track: string | undefined;
    artist: string | undefined;
    album: string | undefined;
    cached: boolean;
}
export declare class SyncLyrics {
    logLevel: "none" | "info" | "warn" | "error" | "debug";
    instrumentalLyricsIndicator: string;
    sources: Sources;
    private lyrics;
    cache: Cache<string | null | undefined, CacheLyrics | null | undefined | null>;
    saveMusixmatchToken: null | undefined | ((tokenData: TokenData) => void | Promise<void>);
    getMusixmatchToken: null | undefined | (() => TokenData | Promise<TokenData | null | undefined> | null | undefined);
    private _fetching;
    private _fetchingTrackId;
    private _fetchingSource;
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
    parseLyrics(lyrics?: string | null | undefined): FormattedLyric[] | null;
    getTrackId(metadata: Metadata): string;
    private warnLog;
    private debugLog;
    private errorLog;
    private infoLog;
}
export declare function normalize(string: string): string;

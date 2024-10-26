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
    cache?: Cache<string, string | undefined | null>;
    saveMusixmatchToken?: (tokenData: TokenData) => void;
    getMusixmatchToken?: () => TokenData | null | undefined;
}
export interface FormattedLyric {
    time: number;
    text: string;
}
export declare class SyncLyrics {
    logLevel: "none" | "info" | "warn" | "error" | "debug";
    instrumentalLyricsIndicator: string;
    sources: Sources;
    lyrics: string | null;
    cache: Cache<string | null | undefined, string | null | undefined>;
    saveMusixmatchToken: null | undefined | ((tokenData: TokenData) => void | Promise<void>);
    getMusixmatchToken: null | undefined | (() => TokenData | Promise<TokenData | null | undefined> | null | undefined);
    _cache: LyricsCache | null;
    _lyricsSource: string | null;
    _fetching: boolean;
    _fetchingTrackId: string | null;
    _fetchingSource: string | null;
    _trackId: string | null;
    constructor(data?: Data);
    private _fetchLyricsMusixmatch;
    private _fetchLyricsNetease;
    private _getLyrics;
    private _parseNeteaseLyrics;
    private _searchLyricsMusixmatch;
    private _searchLyricsNetease;
    private debugLog;
    private errorLog;
    private fetchLyricsLrclib;
    private fetchLyricsMusixmatch;
    private fetchLyricsNetease;
    getLyrics(metadata: Metadata): Promise<{
        trackId: string;
        lyrics: string | null;
        track: string | undefined;
        artist: string | undefined;
        album: string | undefined;
        source: string | null;
        cached: boolean;
        parse: (lyrics?: string | null) => FormattedLyric[] | null;
    }>;
    getTrackId(metadata: Metadata): string;
    private getMusixmatchUsertoken;
    private infoLog;
    parseLyrics(lyrics?: string | null): FormattedLyric[] | null;
    private warnLog;
}
export declare function normalize(string: string): string;

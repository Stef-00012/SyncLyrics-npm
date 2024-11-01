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
    cache?: Cache<string | null | undefined, {
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
            lyrics: Array<{
                end: number;
                start: number;
                lyric: string;
                syncedLyric: Array<{
                    character: string;
                    time: number;
                }>;
            }> | null | undefined;
        };
    } | null | undefined | null>;
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
    lyrics: string | null | undefined;
    cache: Cache<string | null | undefined, {
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
            lyrics: Array<{
                end: number;
                start: number;
                lyric: string;
                syncedLyric: Array<{
                    character: string;
                    time: number;
                }>;
            }> | null | undefined;
        };
    } | null | undefined | null>;
    saveMusixmatchToken: null | undefined | ((tokenData: TokenData) => void | Promise<void>);
    getMusixmatchToken: null | undefined | (() => TokenData | Promise<TokenData | null | undefined> | null | undefined);
    _cache: LyricsCache | null;
    _fetching: boolean;
    _fetchingTrackId: string | null;
    _fetchingSource: string | null;
    _trackId: string | null;
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
    getLyrics(metadata: Metadata, skipCache: boolean): Promise<{
        trackId: string;
        lyrics: {
            lineSynced: {
                parse: (lyrics?: string | null | undefined) => FormattedLyric[] | null;
                source: string | null | undefined;
                lyrics: string | null | undefined;
            };
            plain: {
                source: string | null | undefined;
                lyrics: string | null | undefined;
            };
            wordSynced: {
                source: string | null | undefined;
                lyrics: Array<{
                    end: number;
                    start: number;
                    lyric: string;
                    syncedLyric: Array<{
                        character: string;
                        time: number;
                    }>;
                }> | null | undefined;
            };
        };
        track: string | undefined;
        artist: string | undefined;
        album: string | undefined;
        cached: boolean;
    }>;
    parseLyrics(lyrics?: string | null | undefined): FormattedLyric[] | null;
    getTrackId(metadata: Metadata): string;
    private warnLog;
    private debugLog;
    private errorLog;
    private infoLog;
}
export declare function normalize(string: string): string;

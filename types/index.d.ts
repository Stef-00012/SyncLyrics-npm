type Sources = Array<"musixmatch" | "lrclib" | "netease">;
interface Data {
    logLevel?: "none" | "info" | "warn" | "error" | "debug";
    instrumentalLyricsIndicator?: string;
    sources?: Sources;
}
interface Metadata {
    track?: string;
    artist?: string;
    album?: string;
    length?: number;
}
interface LyricsCache {
    lyrics: string | null;
    trackId: string | null;
}
interface FormattedLyric {
    time: number;
    text: string;
}
export declare class SyncLyrics {
    logLevel: "none" | "info" | "warn" | "error" | "debug";
    instrumentalLyricsIndicator: string;
    sources: Sources;
    _cache: LyricsCache | null;
    _lyricsSource: string | null;
    _fetching: boolean;
    _fetchingTrackId: string | null;
    _fetchingSource: string | null;
    _trackId: string | null;
    constructor(data: Data);
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
        lyrics: any;
        track: string | undefined;
        artist: string | undefined;
        album: string | undefined;
        source: string | null;
        cached: boolean;
    } | null>;
    private getMusixmatchUsertoken;
    private infoLog;
    parseLyrics(lyrics: string): FormattedLyric[];
    private warnLog;
}
export declare function normalize(string: string): string;
export {};

// src/types/types.ts

export interface Media {
    media_id?: number;
    filename: string;
    extension: string;
    size?: MediaSize;
    gpsInfos?: GPSInfos;
    description?: string;
    keywords?: string[];
    title?: string;
    likes?: number;
    captureDate?: string;
}

export interface MediaSize {
    width: number;
    height: number;
}

export interface GPSInfos {
    latitude: number;
    longitude: number;
}

export interface KeywordGroup {
    group: string;
}

export interface KeywordWithGroup {
    keyword: string;
    keyword_groups: string;
}

export interface Album {
    album_id: number;
    title: string;
    description: string;
    cover_photo: Media;
    medias?: Media[] | [];
}

// Define the `FilterType` as a union of string literals
export type FilterType = 'by_id' | 'background' | 'keywords_or' | 'keywords_and' | 'all';
export type SortType = 'Newest' | 'Oldest' | 'Random';
export type KeywordFilterModeType = 'AND' | 'OR';

// Define the `FetchPhotosFilter` interface using the corrected `FilterType`
export interface FetchPhotosFilter {
    keywords?: string[],
    filterType?: FilterType,
    KeywordFilterMode?: KeywordFilterModeType,
    mediaIds?: number[],
    limit?: number,
    offset?: number,
    sort?: SortType
}


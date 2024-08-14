// src/types/types.ts

export interface Photo {
    photo_id: number;
    filename: string;
    extension: string;
    size: PhotoSize;
    gpsInfos: GPSInfos;
    description: string;
    keywords: string[];
    title: string;
}

export interface PhotoSize {
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
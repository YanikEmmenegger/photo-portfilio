// src/types/types.ts

export interface Photo {
    photo_id: number;
    filename: string;
    extension: string;
    size: PhotoSize;
    gpsInfos: GPSInfos;
    description: string;
    keywords: string[];
}

export interface PhotoSize {
    width: number;
    height: number;
}

export interface GPSInfos {
    latitude: number;
    longitude: number;
}

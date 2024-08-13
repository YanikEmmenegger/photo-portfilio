// src/services/transformToPhoto.ts

import {Photo} from '../types/types';

export const transformToPhoto = (item: {
    photo_id: number;
    filename: string;
    extension: string;
    width: number;
    height: number;
    latitude: number;
    longitude: number;
    description: string;
    keyword_list: string[];
}): Photo => ({
    photo_id: item.photo_id,
    filename: item.filename,
    extension: item.extension,
    size: {
        width: item.width,
        height: item.height,
    },
    gpsInfos: {
        latitude: item.latitude,
        longitude: item.longitude,
    },
    description: item.description,
    keywords: item.keyword_list,
});

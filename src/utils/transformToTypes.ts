// src/services/transformToPhoto.ts

import {KeywordGroup, Photo} from '../types/types';

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
    title: string;
    like_count: number;
    capture_date: string;
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
    title: item.title,
    likes: item.like_count || 0,
    captureDate: item.capture_date,
});


export const transformToKeywordWithGroup = (item: { keyword: string, keyword_groups: KeywordGroup | null }) => {

    const keywordGroup = item.keyword_groups != null ? item.keyword_groups.group : 'Other';
    return {
        keyword: item.keyword,
        keyword_groups: keywordGroup,
    };
}


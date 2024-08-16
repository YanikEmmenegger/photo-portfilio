// src/services/supabaseService.ts

import {supabase} from '../clients/supabaseClient';
import {KeywordWithGroup, Photo} from '../types/types';
import {transformToKeywordWithGroup, transformToPhoto} from "./transformToTypes.ts";

// Helper function to fetch data from Supabase and handle errors
const fetchFromSupabase = async <T>(rpcFunction: string, params: Record<string, any> = {}): Promise<T[] | null> => {
    try {
        const {data, error} = await supabase.rpc(rpcFunction, params);
        if (error) throw new Error(error.message);
        return data ? data.map(transformToPhoto) : null;
    } catch (err) {
        console.error(`Error fetching data from ${rpcFunction}:`, err);
        return null;
    }
};

// Unified function to fetch photos based on keywords and filter mode
export const fetchImagesWithFilter = async (filter: {
    keywords?: string[],
    KeywordFilterMode?: string
}, limit: number, offset: number): Promise<Photo[] | null> => {
    if (!filter.keywords || filter.keywords.length === 0) {
        return await fetchAllImages(limit, offset); // Changed to use limit
    }

    const rpcFunction = filter.KeywordFilterMode === 'AND'
        ? 'get_photos_by_keywords_and'
        : 'get_photos_by_keywords_or';

    return await fetchFromSupabase<Photo>(rpcFunction, {
        keywords: filter.keywords,
        limit_count: limit,
        offset_count: offset
    });
};

// Fetch photos by keywords with OR condition
export const fetchImagesByKeywordsOr = async (keywords: string[], limit: number, offset: number): Promise<Photo[] | null> => {
    if (keywords.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_photos_by_keywords_or', {
        keywords,
        limit_count: limit,
        offset_count: offset
    });
};

// Fetch photos by keywords with AND condition
export const fetchImagesByKeywordsAnd = async (keywords: string[], limit: number, offset: number): Promise<Photo[] | null> => {
    if (keywords.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_photos_by_keywords_and', {
        keywords,
        limit_count: limit,
        offset_count: offset
    });
};

// Fetch random background images
export const fetchRandomBackgroundImages = async (limitCount: number): Promise<Photo[] | null> => {
    return await fetchFromSupabase<Photo>('get_random_background_images', {limit_count: limitCount});
};

// Fetch random images
export const fetchRandomImages = async (limitCount: number): Promise<Photo[] | null> => {
    return await fetchFromSupabase<Photo>('get_random_images', {limit_count: limitCount});
};

// Fetch all images with pagination
export const fetchAllImages = async (limitCount: number, offset: number): Promise<Photo[] | null> => {
    console.log('fetching images');
    return await fetchFromSupabase<Photo>('get_images_ordered_by_date', {
        limit_count: limitCount,
        offset_count: offset
    });
};

// Fetch all keywords
export const fetchAllKeywords = async (): Promise<KeywordWithGroup[]> => {
    try {
        const {data, error} = await supabase
            .from('keywords')
            .select('keyword, keyword_groups (group)');

        if (error) throw new Error(error.message);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return data ? data.map(transformToKeywordWithGroup) : [];
    } catch (err) {
        console.error('Error fetching keywords with groups:', err);
        return [];
    }
};

// Fetch images by an array of photo_ids
export const fetchImagesByIds = async (photoIds: number[]): Promise<Photo[] | null> => {
    if (photoIds.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_images_by_ids', {photo_ids: photoIds});
};

// src/services/supabaseService.ts

import {supabase} from '../clients/supabaseClient';
import {KeywordWithGroup, Photo} from '../types/types';
import {transformToKeywordWithGroup, transformToPhoto} from './transformToTypes.ts';

/**
 * Helper function to fetch data from Supabase and handle errors
 * @param rpcFunction - The name of the RPC function to call
 * @param params - The parameters to pass to the RPC function
 * @returns An array of the requested data type or null if an error occurs
 */
const fetchFromSupabase = async <T>(rpcFunction: string, params: Record<string, never> = {}): Promise<T[] | null> => {
    try {
        const {data, error} = await supabase.rpc(rpcFunction, params);
        if (error) throw new Error(error.message);
        return data ? data.map(transformToPhoto) : null;
    } catch (err) {
        console.error(`Error fetching data from ${rpcFunction}:`, err);
        return null;
    }
};

/**
 * Unified function to fetch photos based on keywords and filter mode
 * @param filter - The filter containing keywords and filter mode ('AND' or 'OR')
 * @param limit - The number of photos to retrieve
 * @param offset - The offset for pagination
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchPhotosWithFilter = async (filter: {
    keywords?: string[],
    KeywordFilterMode?: string
}, limit: number, offset: number): Promise<Photo[] | null> => {
    if (!filter.keywords || filter.keywords.length === 0) {
        return await fetchAllPhotos(limit, offset); // Fetch all photos if no keywords are provided
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

/**
 * Fetch photos by keywords using OR condition
 * @param keywords - The keywords to search for
 * @param limit - The number of photos to retrieve
 * @param offset - The offset for pagination
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchPhotosByKeywordsOr = async (keywords: string[], limit: number, offset: number): Promise<Photo[] | null> => {
    if (keywords.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_photos_by_keywords_or', {
        keywords,
        limit_count: limit,
        offset_count: offset
    });
};

/**
 * Fetch photos by keywords using AND condition
 * @param keywords - The keywords to search for
 * @param limit - The number of photos to retrieve
 * @param offset - The offset for pagination
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchPhotosByKeywordsAnd = async (keywords: string[], limit: number, offset: number): Promise<Photo[] | null> => {
    if (keywords.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_photos_by_keywords_and', {
        keywords,
        limit_count: limit,
        offset_count: offset
    });
};

/**
 * Fetch random background photos (landscape-oriented)
 * @param limitCount - The number of random photos to retrieve
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchRandomBackgroundPhotos = async (limitCount: number): Promise<Photo[] | null> => {
    return await fetchFromSupabase<Photo>('get_random_background_photos', {limit_count: limitCount});
};

/**
 * Fetch random landscape-oriented photos
 * @param limitCount - The number of random photos to retrieve
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchRandomLandscapePhotos = async (limitCount: number): Promise<Photo[] | null> => {
    return await fetchFromSupabase<Photo>('get_random_landscape_photos', {limit_count: limitCount});
};

/**
 * Fetch all photos with pagination, ordered by date
 * @param limitCount - The number of photos to retrieve
 * @param offset - The offset for pagination
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchAllPhotos = async (limitCount: number, offset: number): Promise<Photo[] | null> => {
    return await fetchFromSupabase<Photo>('get_photos_ordered_by_date', {
        limit_count: limitCount,
        offset_count: offset
    });
};

/**
 * Fetch all keywords with their associated groups
 * @returns An array of KeywordWithGroup objects
 */
export const fetchAllKeywords = async (): Promise<KeywordWithGroup[]> => {
    try {
        const {data, error} = await supabase
            .from('keywords')
            .select('keyword, keyword_groups (group)');

        if (error) throw new Error(error.message);

        // Transform the result to KeywordWithGroup objects
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return data ? data.map(transformToKeywordWithGroup) : [];
    } catch (err) {
        console.error('Error fetching keywords with groups:', err);
        return [];
    }
};

/**
 * Fetch photos by an array of photo IDs
 * @param photoIds - The array of photo IDs to retrieve
 * @returns An array of Photo objects or null if an error occurs
 */
export const fetchPhotosByIds = async (photoIds: number[]): Promise<Photo[] | null> => {
    if (photoIds.length === 0) return null;
    return await fetchFromSupabase<Photo>('get_photos_by_ids', {photo_ids: photoIds});
};

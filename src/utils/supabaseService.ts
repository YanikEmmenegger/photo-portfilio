import {supabase} from '../clients/supabaseClient';
import {FetchPhotosFilter, KeywordWithGroup, Photo} from '../types/types';
import {transformToKeywordWithGroup, transformToPhoto} from './transformToTypes';

/**
 * Helper function to fetch data from Supabase and handle errors
 * @returns An array of the requested data type or null if an error occurs
 * @param filter
 */

export const fetchPhotosWithFilter = async (filter: FetchPhotosFilter): Promise<Photo[] | null> => {

    //if no filtertype is provided check if there are keywords or photoids if none, set filtertype to all
    let filterType = filter.filterType;
    if (!filterType) {
        if (filter.keywords && filter.keywords.length > 0) {
            filterType = filter.KeywordFilterMode === 'AND' ? 'keywords_and' : 'keywords_or';
        } else if (filter.photoIds) {
            filterType = 'by_id';
        } else {
            filterType = 'all';
        }
    }
    const limit = filter.limit || 30;
    const offset = filter.offset || 0;

    const sort = filter.sort === "Newest" ? "desc" : "asc";

    const photoIds = filter.photoIds || [];
    const keywords = filter.keywords || [];
    try {
        const {data, error} = await supabase.rpc('get_photos_from', {
            filter_type: filterType,
            keywords: keywords,
            photo_ids: photoIds,
            limit_count: limit,
            offset_count: offset,
            sort_order: sort
        });
        console.log(data);
        console.log(error);
        if (error) {
            console.error('Error fetching photos with filter:', error);
            return null;
        }

        return data ? data.map(transformToPhoto) : [];
    } catch (err) {
        console.error('Error fetching photos with filter:', err);
        return null;
    }
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

        if (error) {
            console.error('Error fetching photos with filter:', error);
            return [];
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return data ? data.map(transformToKeywordWithGroup) : [];
    } catch (err) {
        console.error('Error fetching keywords with groups:', err);
        return [];
    }
}
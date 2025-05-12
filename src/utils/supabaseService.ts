import {supabase} from '../clients/supabaseClient';
import {Album, FetchPhotosFilter, KeywordWithGroup, Media, Vote} from '../types/types';
import {transformToAlbum, transformToKeywordWithGroup, transformToPhoto} from './transformToTypes';

/**
 * Helper function to fetch data from Supabase and handle errors
 * @returns An array of the requested data type or null if an error occurs
 * @param filter
 */

export const fetchPhotosWithFilter = async (filter: FetchPhotosFilter): Promise<Media[] | null> => {

    //if no filtertype is provided check if there are keywords or photoids if none, set filtertype to all
    let filterType = filter.filterType;
    if (!filterType) {
        if (filter.keywords && filter.keywords.length > 0) {
            filterType = filter.KeywordFilterMode === 'AND' ? 'keywords_and' : 'keywords_or';
        } else if (filter.mediaIds) {
            filterType = 'by_id';
        } else {
            filterType = 'all';
        }
    }
    const limit = filter.limit || 30;
    const offset = filter.offset || 0;

    const sort = filter.sort === "Newest" ? "desc" : "asc";

    const photoIds = filter.mediaIds || [];
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

export const fetchAlbums = async (): Promise<Album[]> => {
    try {
        const {data, error} = await supabase
            .from('albums')
            .select('*');

        if (error) {
            console.error('Error fetching albums:', error);
            return [];
        }

        //fetch cover image for each album
        for (let i = 0; i < data.length; i++) {
            const album = data[i];
            //fetch cover photo
            const {data: coverPhoto, error: coverPhotoError} = await supabase
                .from('photos')
                .select('filename, extension')
                .eq('photo_id', album.cover_photo_id)
                .single();

            if (coverPhotoError) {
                console.error('Error fetching cover photo for album:', coverPhotoError);
            }
            if (coverPhoto) {
                album.cover_photo = {
                    photo_id: album.cover_photo_id,
                    filename: coverPhoto.filename,
                    extension: coverPhoto.extension,
                };
            }
        }

        return data ? data.map(transformToAlbum) : [];

    } catch (err) {
        console.error('Error fetching albums:', err);
        return [];
    }
}

/**
 * Fetches an album by its ID, including its photos.
 * @param albumId - The ID of the album to fetch.
 * @returns The album with photos, or null if an error occurs.
 */
export const fetchAlbumById = async (albumId: number): Promise<Album | null> => {
    try {
        // Call the PostgreSQL function to fetch album data
        const {data, error} = await supabase.rpc('get_album_with_photos', {
            p_album_id: albumId
        });

        if (error) {
            console.error('Error fetching album by id:', error);
            return null;
        }

        // Check if data is returned and map it to the Album type
        if (data && data.length > 0) {
            const {data: coverPhoto, error: coverPhotoError} = await supabase
                .from('photos')
                .select('filename, extension')
                .eq('photo_id', data[0].cover_photo_id)
                .single();

            if (coverPhotoError) {
                console.error('Error fetching cover photo for album:', coverPhotoError);
            }
            if (coverPhoto) {
                data[0].cover_photo = {
                    photo_id: data[0].cover_photo_id,
                    filename: coverPhoto.filename,
                    extension: coverPhoto.extension,
                };
            }
            // Since we expect a single row, use [0] to get the first item from the array
            const albumData = data[0];
            return transformToAlbum(albumData);
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error fetching album by id:', err);
        return null;
    }
};


// Fetch liked images from the database
export const fetchLikedImagesFromDb = async (userId: string | null) => {

    const {data: likes, error} = await supabase
        .from('likes')
        .select('photo_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching liked images:', error);
        return [];
    }

    return likes?.map(like => like.photo_id) || [];
};

// Add a liked image to the database
export const addLikedImageToDb = async (photoId: number, userId: string | null) => {
    if (!userId) return false
    const {error} = await supabase
        .from('likes')
        .insert([{user_id: userId, photo_id: photoId}]);

    if (error) {
        console.error('Error adding liked image:', error);
        return false;
    }
    return true;
}


// Remove a liked image from the database
export const removeLikedImageFromDB = async (photoId: number, userId: string | null) => {
    if (!userId) return false
    const {error} = await supabase
        .from('likes')
        .delete()
        .match({user_id: userId, photo_id: photoId});

    if (error) {
        console.error('Error removing liked image:', error);
        return false;
    }
    return true;
}

export const submitVoteToDB = async (userId: string, media1_id: number, media2_id: number, selected_photo_id: number) => {
    if (!userId) return false
    const {error} = await supabase
        .from('votes')
        .insert([{user_id: userId, media1_id: media1_id, media2_id: media2_id, selected_photo_id: selected_photo_id}]);

    if (error) {
        console.error('Error adding liked image:', error);
        return false;
    }
    return true;
}


export const getUnvotedMediaPair = async (userId: string | null, photoId?: number, position?: string) => {
    if (!userId) return false

    try {
        const {data, error} = await supabase.rpc('get_unvoted_media_pair', {
            p_user_id: userId,
            p_photo_id: photoId,
            p_position: position ? position : "media2"
        })

        if (error) {
            console.error('RPC error:', error)
            return false
        }

        if (!data || data.length === 0) return false

        const {media1_id, media2_id} = data[0]

        const filter: FetchPhotosFilter = {
            mediaIds: [media1_id, media2_id],
        }

        return await fetchPhotosWithFilter(filter)
    } catch (err) {
        console.error('Unexpected error:', err)
        return []
    }
}

export const fetchUserVote = async (userId: string): Promise<Vote[]> => {
    const {data: votes, error} = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching votes :', error);
        return [];
    }

    return votes || [];
}

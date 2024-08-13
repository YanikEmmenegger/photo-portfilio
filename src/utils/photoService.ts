// src/services/photoService.ts

import {supabase} from '../clients/supabaseClient';
import {Photo} from '../types/types';
import {transformToPhoto} from "./transformToTypes.ts";

// Function to fetch photos by keywords
export const fetchPhotosByKeywords = async (keywords: string[]): Promise<Photo[] | null> => {

    if (keywords.length === 0) {
        return null;
    }

    try {
        const {data, error} = await supabase.rpc('get_photos_by_keywords', {keywords});

        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            return null;
        }

        return data.map(transformToPhoto);
    } catch (err) {
        console.error('Error fetching photos by keywords:', err);
        return null;
    }
};


export const fetchRandomLandscapeImages = async (limitCount: number): Promise<Photo[] | null> => {
    try {
        const {data, error} = await supabase.rpc('get_random_landscape_images', {limit_count: limitCount});

        if (error) {
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            return null;
        }

        return data.map(transformToPhoto);
    } catch (err) {
        console.error('Error fetching random landscape images:', err);
        return null;
    }
};



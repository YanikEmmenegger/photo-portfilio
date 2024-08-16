import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Photo } from '../types/types';
import { fetchImagesWithFilter } from "../utils/supabaseService.ts";
import FilterComponent from "../components/Filter/FilterComponent.tsx";
import { AnimatePresence } from 'framer-motion';
import RenderGalleryContent from "../components/Gallery/renderGalleryContent.tsx";
import debounce from 'lodash/debounce';

const ImagesPage = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [limit] = useState(30);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch images with or without filters
    const fetchImages = async () => {
        setError(null);
        //setLoading(true);
        try {
            const query = new URLSearchParams(location.search);
            const keywords = query.get('keywords')?.split(';') || [];
            const KeywordFilterMode = query.get('KeywordFilterMode') === 'AND' ? 'AND' : 'OR';

            const filter = {
                keywords: keywords,
                KeywordFilterMode: KeywordFilterMode
            };

            const newPhotos = await fetchImagesWithFilter(filter, limit, offset);

            if (newPhotos === null || newPhotos.length === 0) {
                setHasMore(false); // No more images available
            } else {
                setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch images when offset or filters change
    useEffect(() => {
        setLoading(true);
        setOffset(0);
        setPhotos([]);
        setHasMore(true);
        fetchImages();  // Call fetchImages here to load the new images
    }, [location.search]);

    useEffect(() => {
        if (hasMore && !loading) {
            fetchImages();
        }
    }, [offset, hasMore]);

    // Handle scroll event to detect when user is at the bottom
    const handleScroll = useCallback(debounce(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
            if (hasMore) {
                setOffset((prevOffset) => prevOffset + limit); // Increment by limit
            }
        }
    }, 200), [hasMore, limit]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const resetFilters = () => {
        navigate({ search: '' }, { replace: true });
    };

    // Determine if filters are set
    const areFiltersActive = () => {
        const query = new URLSearchParams(location.search);
        return query.has('keywords');
    };

    return (
        <div className="w-full h-auto">
            <div className="gap-2 flex justify-end p-2 md:p-4">
                {areFiltersActive() && (
                    <button
                        className="px-4 py-2 rounded-full text-sm font-bold bg-red-500 text-white"
                        onClick={resetFilters}>
                        Reset
                    </button>
                )}
                <button
                    className="px-4 py-2 rounded-full text-sm font-bold bg-blue-500 text-white"
                    onClick={() => setShowFilters(true)}>
                    Show Filters
                </button>
            </div>
            <AnimatePresence>
                {showFilters && (
                    <FilterComponent onClose={() => setShowFilters(false)} />
                )}
            </AnimatePresence>
            <RenderGalleryContent
                loading={loading}
                photos={photos}
                error={error}
                header={"No photos found, try a different filter"}
                text={""}
                showAllImages={false}
            />
        </div>
    );
};

export default ImagesPage;

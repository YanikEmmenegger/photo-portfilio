import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FetchPhotosFilter, Media, SortType } from '../types/types';
import FilterComponent from '../components/Filter/FilterComponent';
import { AnimatePresence } from 'framer-motion';
import { fetchPhotosWithFilter } from '../utils/supabaseService';
import Gallery from '../components/Gallery/Gallery';
import { useDebouncedCallback } from 'use-debounce';

const LIMIT = 20;

const MediaPage = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [photos, setPhotos] = useState<Media[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const fetchImages = useCallback(async (newOffset = 0) => {
        setError(null);
        try {
            const keywords = searchParams.get('keywords')?.split(';') || [];
            const KeywordFilterMode = searchParams.get('KeywordFilterMode') === 'AND' ? 'AND' : 'OR';
            const sort = (searchParams.get('sort') as SortType) || 'Newest';

            const filter: FetchPhotosFilter = {
                keywords,
                KeywordFilterMode,
                sort,
                limit: LIMIT,
                offset: newOffset,
            };

            const newPhotos = await fetchPhotosWithFilter(filter);
            if (!newPhotos || newPhotos.length === 0) {
                setHasMore(false);
            } else {
                setPhotos(prev => (newOffset === 0 ? newPhotos : [...prev, ...newPhotos]));
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);
        setOffset(0);
        setPhotos([]);
        setHasMore(true);
        fetchImages(0);
    }, [searchParams, fetchImages]);

    useEffect(() => {
        if (hasMore && offset > 0) {
            setIsLoadingMore(true);
            fetchImages(offset);
        }
    }, [offset, hasMore, fetchImages]);

    // Modern debounce without Lodash
    const handleScroll = useDebouncedCallback(() => {
        if (
            window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 300 &&
            hasMore &&
            !isLoadingMore
        ) {
            setOffset(prev => prev + LIMIT);
        }
    }, 200);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const resetFilters = useCallback(() => {
        navigate({ search: '' }, { replace: true });
    }, [navigate]);

    const areFiltersActive = useCallback(() => searchParams.has('keywords'), [searchParams]);

    return (
        <div className="w-full flex flex-col min-h-screen">
            <div className="gap-2 flex justify-end p-2 md:p-4">
                {areFiltersActive() && (
                    <button
                        type="button"
                        className="px-4 py-2 rounded-full text-sm font-bold bg-red-500 text-white"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>
                )}
                <button
                    type="button"
                    className="px-4 py-2 rounded-full text-sm font-bold bg-blue-500 text-white"
                    onClick={() => setShowFilters(true)}
                >
                    Show Filters
                </button>
            </div>
            <AnimatePresence>
                {showFilters && <FilterComponent onClose={() => setShowFilters(false)} />}
            </AnimatePresence>
            <Gallery error={error} loading={loading} medias={photos} />
            <div className="w-full py-4 flex flex-col items-center">
                {isLoadingMore && (
                    <span className="text-lg font-semibold text-gray-500">Loading more...</span>
                )}
                {!hasMore && (
                    <span className="text-lg font-semibold text-gray-500">No more media.</span>
                )}
            </div>
        </div>
    );
};

export default MediaPage;

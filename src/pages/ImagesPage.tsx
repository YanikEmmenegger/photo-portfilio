import {useState, useEffect, useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Photo} from '../types/types';
import FilterComponent from '../components/Filter/FilterComponent.tsx';
import {AnimatePresence} from 'framer-motion';
import RenderGalleryContent from '../components/Gallery/renderGalleryContent.tsx';
import debounce from 'lodash/debounce';
import {AiOutlineLoading} from 'react-icons/ai';
import {fetchPhotosWithFilter} from '../utils/supabaseService.ts';

const ImagesPage = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [limit] = useState(30);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch images with or without filters
    const fetchImages = useCallback(async (newOffset = 0) => {
        console.log('fetching images___');
        setError(null);

        try {
            const query = new URLSearchParams(location.search);
            const keywords = query.get('keywords')?.split(';') || [];
            const KeywordFilterMode = query.get('KeywordFilterMode') === 'AND' ? 'AND' : 'OR';

            const filter = {
                keywords: keywords,
                KeywordFilterMode: KeywordFilterMode,
            };

            const newPhotos = await fetchPhotosWithFilter(filter, limit, newOffset);

            if (newPhotos === null || newPhotos.length === 0) {
                setHasMore(false); // No more images available
            } else {
                setPhotos((prevPhotos) => (newOffset === 0 ? newPhotos : [...prevPhotos, ...newPhotos]));
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [location.search, limit]);

    // Fetch images when filters change (resets state)
    useEffect(() => {
        setLoading(true);
        setOffset(0);
        setPhotos([]);
        setHasMore(true);
        fetchImages(0);  // Fetch images with reset offset
    }, [location.search, fetchImages]);

    // Handle offset changes for pagination
    useEffect(() => {
        if (hasMore && offset > 0) {
            fetchImages(offset);
        }
    }, [offset, hasMore, fetchImages]);

    // Handle scroll event to detect when user is close to the bottom
    const handleScroll = useCallback(debounce(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
            if (hasMore && !isLoadingMore) {
                console.log('loading more');
                setOffset((prevOffset) => prevOffset + limit); // Increment by limit
            }
        }
    }, 200), [hasMore, limit, isLoadingMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const resetFilters = () => {
        navigate({search: ''}, {replace: true});
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
                    <FilterComponent onClose={() => setShowFilters(false)}/>
                )}
            </AnimatePresence>
            <RenderGalleryContent
                loading={loading}
                photos={photos}
                error={error}
                header="No photos found, try a different filter"
                text=""
                showAllImages={false}
            />
            {!hasMore && photos.length > 1 && (
                <div className="w-full mt-20 p-20 text-center">
                    <p className="text-xl">No more images to show</p>
                </div>
            )}
            {isLoadingMore && photos.length > 1 && (
                <div className="w-full mt-20 text-5xl flex items-center justify-center">
                    <AiOutlineLoading className="animate-spin"/>
                </div>
            )}
        </div>
    );
};

export default ImagesPage;

import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Photo} from '../types/types';
import {fetchImagesWithFilter} from "../utils/supabaseService.ts";
import FilterComponent from "../components/Filter/FilterComponent.tsx";
import {AnimatePresence} from 'framer-motion';
import RenderGalleryContent from "../components/Gallery/renderGalleryContent.tsx";

const ImagesPage = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            setError(null);

            try {
                const query = new URLSearchParams(location.search);
                const keywords = query.get('keywords')?.split(';') || [];
                const KeywordFilterMode = query.get('KeywordFilterMode') === 'AND' ? 'AND' : 'OR';

                const filter = {
                    keywords: keywords,
                    KeywordFilterMode: KeywordFilterMode
                }

                const newPhotos = await fetchImagesWithFilter(filter);

                setPhotos(newPhotos || []);

            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [location.search]);

    const resetFilters = () => {
        navigate({search: ''}, {replace: true});
    }

    // Determine if filters are set
    const areFiltersActive = () => {
        const query = new URLSearchParams(location.search);
        return query.has('keywords') || query.has('KeywordFilterMode');
    }




    return (
        <div className="w-full h-auto">
            <div className="gap-2 hidden md:flex justify-end p-4">
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
            <RenderGalleryContent loading={loading} error={error} photos={photos} showAllImages={false}
                                  header={"No photos found, try a different filter"}
                                  text={""}/>
        </div>
    );
};

export default ImagesPage;

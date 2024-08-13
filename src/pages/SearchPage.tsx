import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import PhotoGallery from '../components/Gallery/PhotoGallery';
import {Photo} from '../types/types';
import {fetchPhotosByKeywords} from "../utils/photoService.ts";

const SearchPage = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();

    useEffect(() => {
        // Extract query parameters
        const query = new URLSearchParams(location.search);
        const keywords = query.get('keywords')?.split(';') || [];

        if (keywords.length > 0) {
            const fetchPhotos = async () => {
                try {
                    const fetchedPhotos = await fetchPhotosByKeywords(keywords);
                    setPhotos(fetchedPhotos || []);
                } catch (err) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchPhotos();
        } else {
            setPhotos([]);
            setLoading(false);
        }
    }, [location.search]);

    return (
        <div className="w-full h-auto">
            {error && <div>{error}</div>}
            <PhotoGallery loading={loading} photos={photos}/>
        </div>
    );
};

export default SearchPage;

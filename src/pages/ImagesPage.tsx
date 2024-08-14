import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PhotoGallery from '../components/Gallery/PhotoGallery';
import { Photo } from '../types/types';
import { fetchImagesByKeywords, fetchRandomImages } from "../utils/supabaseService.ts";
import {AiOutlineLoading} from "react-icons/ai";

const ImagesPage = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            setError(null);

            try {
                const query = new URLSearchParams(location.search);
                const keywords = query.get('keywords')?.split(';') || [];

                const fetchedPhotos = keywords.length > 0
                    ? await fetchImagesByKeywords(keywords)
                    : await fetchRandomImages(1000);

                setPhotos(fetchedPhotos || []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [location.search]);

    const renderContent = () => {
        if (loading) return <div className="mx-auto mt-20 w-auto flex flex-col justify-center items-center text-center"><AiOutlineLoading className={"animate-spin mb-5"} fontSize={"70px"}/>Loading...</div>;
        if (error) return <div className="w-full text-center text-red-500">{error}</div>;
        if (photos.length === 0) return <div className="mt-10 text-4xl w-full text-center">No photos found, try different filter</div>;

        return <PhotoGallery photos={photos} loading={loading}/>;
    };

    return (
        <div className="w-full h-auto">

            {renderContent()}
        </div>
    );
};

export default ImagesPage;

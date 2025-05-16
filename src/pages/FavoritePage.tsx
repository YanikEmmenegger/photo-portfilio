import {useEffect, useState} from "react";
import {FetchPhotosFilter, Media} from "../types/types.ts";
import {useUser} from "../contexts/UserContext.tsx";
import {fetchPhotosWithFilter} from "../utils/supabaseService.ts";
import Gallery from "../components/Gallery/Gallery.tsx";

const FavoritePage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [medias, setMedias] = useState<Media[]>([]);

    const {userId, likedImageIDs, openLoginModal} = useUser();

    useEffect(() => {
        if (!userId) return; // Don’t fetch if not logged in

        const fetchPhotos = async () => {
            setLoading(true);
            setError(null);

            try {
                const filter: FetchPhotosFilter = {
                    mediaIds: likedImageIDs,
                    sort: 'Newest',
                };
                const newPhotos = await fetchPhotosWithFilter(filter);
                setMedias(newPhotos ?? []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [userId, likedImageIDs]);

    if (!userId) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-2xl font-semibold mb-4">Favorites unavailable</h2>
                <p className="text-gray-400 mb-6">
                    You need to be logged in to view your favorite images.
                    Once logged in, your liked photos will appear here.
                </p>
                <button
                    onClick={openLoginModal}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition"
                >
                    Login to view favorites
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-auto">
            <Gallery medias={medias} loading={loading} error={error} />
        </div>
    );
};

export default FavoritePage;

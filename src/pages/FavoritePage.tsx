import {useEffect, useState} from "react";
import {FetchPhotosFilter, Media} from "../types/types.ts";
import {useUser} from "../contexts/UserContext.tsx";
import {fetchPhotosWithFilter} from "../utils/supabaseService.ts";
import Gallery from "../components/Gallery/Gallery.tsx";


const FavoritePage = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [medias, setMedias] = useState<Media[]>([]);

    const {likedImageIDs} = useUser();

    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            setError(null);

            try {
                const filter:FetchPhotosFilter = {
                    mediaIds: likedImageIDs,
                    sort: 'Newest'
                }
                const newPhotos = await fetchPhotosWithFilter(filter);

                if (newPhotos === null || newPhotos.length === 0) {
                    setMedias([]);
                } else {
                    setMedias(newPhotos);
                }

            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos().then(r => r);
    }, [likedImageIDs]);


    return (
        <div className={"w-full h-auto"}>
            <Gallery medias={medias} loading={loading} error={error} />
        </div>
    );
}

export default FavoritePage;

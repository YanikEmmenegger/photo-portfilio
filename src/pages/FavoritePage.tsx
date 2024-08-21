import {useEffect, useState} from "react";
import {FetchPhotosFilter, Photo} from "../types/types.ts";
import {useUser} from "../contexts/UserContext.tsx";
import RenderGalleryContent from "../components/Gallery/renderGalleryContent.tsx";
import {fetchPhotosWithFilter} from "../utils/supabaseService.ts";


const FavoritePage = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);

    const {likedImageIDs} = useUser();

    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            setError(null);

            try {
                const filter:FetchPhotosFilter = {
                    photoIds: likedImageIDs,
                    sort: 'Newest'
                }
                const newPhotos = await fetchPhotosWithFilter(filter);

                if (newPhotos === null || newPhotos.length === 0) {
                    setPhotos([]);
                } else {
                    setPhotos(newPhotos);
                }

            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [likedImageIDs]);


    return (
        <div className={"w-full h-auto"}>
            <RenderGalleryContent loading={loading} error={error} photos={photos} showAllImages={true}
                                  header={"No liked photos found, start liking"}
                                  text={"this feature doesnt wok in Private Mode"}/>
        </div>
    );
}

export default FavoritePage;
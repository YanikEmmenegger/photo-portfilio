import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Album} from "../types/types.ts";
import {fetchAlbumById} from "../utils/supabaseService.ts";
import toast from "react-hot-toast";
import AlbumHeader from "../components/Album/AlbumHeader.tsx";
import AlbumPhoto from "../components/Album/AlbumPhoto.tsx";
import {AiOutlineLoading} from "react-icons/ai";

const AlbumDetailPage = () => {
    const {albumId} = useParams();
    const navigate = useNavigate();

    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbum = async () => {
            const fetchedAlbum = await fetchAlbumById(parseInt(albumId!));
            if (fetchedAlbum) {
                setAlbum(fetchedAlbum);
                setLoading(false);
            } else {
                toast.error('Album not found');
                navigate('/albums');
            }
        };

        fetchAlbum();
    }, [albumId, navigate]);


    return (
        <div>
            {loading ? (<div className={"w-full mt-56 text-5xl flex justify-center "}>
                <AiOutlineLoading className={"animate-spin"}/>
            </div>) : (
                <>
                    <div>
                        <AlbumHeader
                            description={album!.description}
                            title={album!.title}
                            coverPhoto={album!.cover_photo}
                        />
                    </div>
                    <h1 className="mt-10 text-5xl text-center">Album Photos</h1>

                    {album!.photos!.length > 0 && (
                        album!.photos!.map((photo, index) => (
                            <AlbumPhoto
                                key={index}
                                photo={photo}
                                index={index}
                            />
                        ))
                    )}
                </>
            )}
        </div>
    );
};

export default AlbumDetailPage;

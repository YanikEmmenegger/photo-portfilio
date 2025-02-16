import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Album, Media} from "../types/types";
import {fetchAlbumById} from "../utils/supabaseService";
import toast from "react-hot-toast";
import AlbumHeader from "../components/Album/AlbumHeader";
import AlbumMedia from "../components/Album/AlbumMedia";
import {AiOutlineLoading} from "react-icons/ai";
import MediaInfoBox from "../components/Gallery/MediaInfoBox.tsx";


const AlbumDetailPage = () => {

    const [mediaInInfoBox, setMediaInInfoBox] = useState<Media | null>(null);
/*
    const [isMobileAndOrTouch, setIsMobileAndOrTouch] = useState(false);
*/
    const {albumId} = useParams();
    const navigate = useNavigate();

    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);


    // Disable page scrolling when the MediaInfoBox is open
    useEffect(() => {
        if (mediaInInfoBox) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mediaInInfoBox]);

    useEffect(() => {
        const fetchAlbum = async () => {
            const fetchedAlbum = await fetchAlbumById(parseInt(albumId!));
            if (fetchedAlbum) {
                setAlbum(fetchedAlbum);
                setLoading(false);
            } else {
                toast.error("Album not found");
                navigate("/albums");
            }
        };

        fetchAlbum();
    }, [albumId, navigate]);

    return (
        <div className="min-h-screen">
            {loading || !album ? (
                <div className="w-full  mt-56 text-5xl flex justify-center">
                    <AiOutlineLoading className="animate-spin"/>
                </div>
            ) : (
                <>
                    <AlbumHeader
                        title={album.title}
                        description={album.description}
                        coverPhoto={album.cover_photo}
                    />
                    {mediaInInfoBox && (
                        <MediaInfoBox
                            isExpanded={true}
                            media={mediaInInfoBox}
                            onClose={() => setMediaInInfoBox(null)}
                        />
                    )}

                    <div className=" w-full max-w-[2000px] mx-auto p-4">
                        {/* On small/medium screens: one column; on large screens: 12-column grid centered */}
                        <div className="flex-wrap flex items-center justify-center">


                            {album.medias!.map((media, index) => (



                                    <AlbumMedia onClick={()=>setMediaInInfoBox(media)} key={media.media_id || index} media={media} index={index}/>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AlbumDetailPage;

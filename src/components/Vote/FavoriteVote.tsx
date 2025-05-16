import {useUser} from "../../contexts/UserContext.tsx";
import {useEffect, useState} from "react";
import {Media} from "../../types/types.ts";
import {fetchPhotosWithFilter, fetchTopRatedMedias} from "../../utils/supabaseService.ts";
import MediaInfoBox from "../Gallery/MediaInfoBox.tsx";
import {AiOutlineFullscreen} from "react-icons/ai";

const FavoriteVote = () => {
    const {votes} = useUser();
    const [favoriteMedia, setFavoriteMedia] = useState<Media | null>(null);
    const [communityFavorite, setCommunityFavorite] = useState<Media | null>(null);
    const [mediaInInfoBox, setMediaInInfoBox] = useState<Media | null>(null);

    // Disable scrolling when modal open
    useEffect(() => {
        document.body.style.overflow = mediaInInfoBox ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mediaInInfoBox]);

    useEffect(() => {
        // Get user's favorite
        if (!votes || votes.length === 0) return;

        const voteCounts: Record<number, number> = {};
        for (const vote of votes) {
            const id = vote.selected_photo_id;
            voteCounts[id] = (voteCounts[id] || 0) + 1;
        }

        const mostVotedId = parseInt(Object.entries(voteCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]);

        const fetchUserFavorite = async () => {
            const result = await fetchPhotosWithFilter({mediaIds: [mostVotedId]});
            if (result && result.length > 0) {
                setFavoriteMedia(result[0]);
            }
        };

        fetchUserFavorite();
    }, [votes]);

    useEffect(() => {
        const fetchCommunityFavorite = async () => {
            const top = await fetchTopRatedMedias(1);
            if (top && top.length > 0) {
                const result = await fetchPhotosWithFilter({mediaIds: [top[0].photo_id]});
                if (result && result.length > 0) {
                    setCommunityFavorite(result[0]);
                }
            }
        };

        fetchCommunityFavorite();
    }, []);

    const baseUrl = import.meta.env.VITE_MEDIA_BASE_URL.endsWith("/")
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const renderMedia = (media: Media, label: string) => {
        const src = `${baseUrl}${media.filename}${media.extension}`;
        return (
            <div
                className="w-full max-w-md rounded border border-neutral-700 overflow-hidden group transform transition duration-500 hover:scale-105"

            >
                <div className="relative">
                    <div className="bg-neutral-800 py-2 text-white text-center font-semibold">{label}</div>

                    {media.extension === ".mp4" ? (
                        <video src={src} controls loop className="w-full h-auto object-contain"/>
                    ) : (
                        <img src={src} alt={media.title || label} className="w-full h-auto object-contain"/>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AiOutlineFullscreen onClick={() => setMediaInInfoBox(media)} className="w-6 h-6 cursor-pointer text-white"/>
                    </div>
                </div>
            </div>
        );
    };

    if (!favoriteMedia && !communityFavorite) return <></>;

    return (
        <>
            {mediaInInfoBox && (
                <MediaInfoBox
                    isExpanded={true}
                    media={mediaInInfoBox}
                    onClose={() => setMediaInInfoBox(null)}
                />
            )}
            <div className="p-4 flex flex-col gap-6 justify-center items-center animate-fade-in">

                <div>
                    <h1 className={"text-xl md:text-3xl"}>
                        Top Rated:
                    </h1>
                </div>
                <div className={"flex-col flex  gap-6 items-center justify-center lg:flex-row"}>

                    {favoriteMedia && renderMedia(favoriteMedia, "Your Favorite")}
                    {communityFavorite && renderMedia(communityFavorite, "Community Favorite")}
                </div>
        </div>
        </>
    );
};

export default FavoriteVote;

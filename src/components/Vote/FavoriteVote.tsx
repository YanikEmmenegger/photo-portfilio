import {useUser} from "../../contexts/UserContext.tsx";
import {useEffect, useState} from "react";
import {Media} from "../../types/types.ts";
import {fetchPhotosWithFilter} from "../../utils/supabaseService.ts";

const FavoriteVote = () => {
    const {votes} = useUser();
    const [favoriteMedia, setFavoriteMedia] = useState<Media | null>(null);

    useEffect(() => {
        if (!votes || votes.length === 0) return;

        const voteCounts: Record<number, number> = {};

        for (const vote of votes) {
            const id = vote.selected_photo_id;
            voteCounts[id] = (voteCounts[id] || 0) + 1;
        }

        const mostVotedId = Object.entries(voteCounts).reduce((a, b) =>
            a[1] > b[1] ? a : b
        )[0];

        const fetchFavoriteMedia = async () => {
            const result = await fetchPhotosWithFilter({
                mediaIds: [parseInt(mostVotedId)],
            });

            if (result && result.length > 0) {
                setFavoriteMedia(result[0]);
            }
        };

        fetchFavoriteMedia();
    }, [votes]);

    return (
        <div className="p-4 rounded-lg flex flex-col items-center text-white text-center">
            <h2 className="text-lg font-semibold mb-4">You voted mostly for:</h2>
            {favoriteMedia ? (
                <div className="w-full max-w-md border border-neutral-700 rounded overflow-hidden">
                    <img
                        src={`${import.meta.env.VITE_MEDIA_BASE_URL}/${favoriteMedia.filename}${favoriteMedia.extension}`}
                        alt={favoriteMedia.title || "Favorite Photo"}
                        className="w-full h-auto object-contain"
                    />
                </div>
            ) : (
                <p className="text-gray-400 text-sm">No favorite yet.</p>
            )}
        </div>
    );
};

export default FavoriteVote;

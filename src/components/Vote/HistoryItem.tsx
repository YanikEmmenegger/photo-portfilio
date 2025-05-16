import {FC, useEffect, useState} from "react";
import {FetchPhotosFilter, Media, Vote} from "../../types/types.ts";
import {fetchPhotosWithFilter} from "../../utils/supabaseService.ts";
import {twMerge} from "tailwind-merge";
import {BsCameraVideo} from "react-icons/bs";
import {AiOutlineCheck, AiOutlineStop} from "react-icons/ai"; // Looser icon

interface HistoryItemProps {
    vote: Vote;
}

const HistoryItem: FC<HistoryItemProps> = ({ vote }) => {
    const [loading, setLoading] = useState(true);
    const [medias, setMedias] = useState<Media[]>([]);
    const [error, setError] = useState<string | boolean>(false);

    useEffect(() => {
        const fetchImages = async () => {
            const filter: FetchPhotosFilter = {
                mediaIds: [vote.media1_id, vote.media2_id],
            };

            const fetchedMedias = await fetchPhotosWithFilter(filter);
            if (!fetchedMedias || fetchedMedias.length < 2) {
                return setError("Failed to load media");
            }

            setMedias(fetchedMedias);
            setLoading(false);
        };

        fetchImages();
    }, [vote]);

    if (loading) return <div className="text-neutral-400 text-sm"></div>;
    if (error) return <div className="text-red-500 text-sm">{error}</div>;

    return (
        <div className="flex items-center gap-4 p-10 rounded-lg shadow-md w-fit">
            {medias.map((media) => {
                const isSelected = media.media_id === vote.selected_photo_id;
                const baseUrl = import.meta.env.VITE_MEDIA_BASE_URL.endsWith("/")
                    ? import.meta.env.VITE_MEDIA_BASE_URL
                    : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

                const src =
                    media.extension === ".mp4"
                        ? `${baseUrl}${media.filename}.jpg`
                        : `${baseUrl}${media.filename}${media.extension}`;

                return (
                    <div
                        key={media.media_id}
                        className={twMerge(
                            `relative w-30 h-20 md:w-60 md:h-40 rounded-md overflow-hidden border-0`,
                            !isSelected && "opacity-40 rotate-12"
                        )}
                    >
                        <img
                            src={src}
                            alt={media.title || "Photo"}
                            className="w-full h-full object-cover"
                        />

                        {/* Video Icon */}
                        {media.extension === ".mp4" && (
                            <BsCameraVideo className="absolute bottom-1 left-1 w-5 h-5 opacity-80 text-white"/>
                        )}

                        {/* Looser Overlay Icon */}
                        {!isSelected ? (
                            <div className="absolute top-1 right-1 rounded-full p-1">
                                <AiOutlineStop className="w-6 h-6 text-red-500"/>
                            </div>
                        ) : (
                            <div className="absolute top-1 right-1 rounded-full p-1">
                                <AiOutlineCheck className="w-6 h-6 text-green-500"/>
                            </div>
                        )

                        }
                    </div>
                );
            })}
        </div>
    );
};

export default HistoryItem;

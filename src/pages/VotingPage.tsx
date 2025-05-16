import { FC, useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext.tsx";
import { Media } from "../types/types.ts";
import VotePhoto from "../components/Vote/VotePhoto.tsx";
import { AnimatePresence, motion } from "framer-motion";
import VoteHistory from "../components/Vote/VoteHistory.tsx";
import FavoriteVote from "../components/Vote/FavoriteVote.tsx";
import VoteVideo from "../components/Vote/VoteVideo.tsx";
import MediaInfoBox from "../components/Gallery/MediaInfoBox.tsx";
import { AiOutlineFullscreen } from "react-icons/ai";

const VotingPage: FC = () => {
    const { votePair, submitVote, requireLogin, userId } = useUser();
    const [loading, setLoading] = useState(true);
    const [heart, setHeart] = useState<{ x: number; y: number } | null>(null);
    const [mediaInInfoBox, setMediaInInfoBox] = useState<Media | null>(null);
    const [hasTriedLogin, setHasTriedLogin] = useState(false);

    // Disable scrolling when modal open
    useEffect(() => {
        document.body.style.overflow = mediaInInfoBox ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mediaInInfoBox]);

    useEffect(() => {
        setLoading(!votePair);

        if (!userId && !hasTriedLogin) {
            requireLogin();
            setHasTriedLogin(true);
        }
    }, [votePair, userId, hasTriedLogin]);

    const handleVote = async (e: React.MouseEvent<HTMLDivElement>, selected: Media) => {
        const x = e.clientX;
        const y = e.clientY;

        setHeart({ x, y });
        setTimeout(() => setHeart(null), 700);

        await submitVote(selected.media_id!);
    };

    const renderMedia = (media: Media) => (
        <div className="relative group">
            <div
                className="w-full h-[40vh] md:h-[55vh] group flex items-center transition duration-500 rounded justify-center overflow-hidden cursor-pointer hover:scale-[101%]"
                onClick={(e) => handleVote(e, media)}
            >
                {media.extension === ".mp4" ? (
                    <VoteVideo video={media} />
                ) : (
                    <VotePhoto photo={media} />
                )}
            </div>
            <div className="absolute hidden md:block top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <AiOutlineFullscreen
                    onClick={() => setMediaInInfoBox(media)}
                    className="w-8 h-8 cursor-pointer text-white"
                />
            </div>
        </div>
    );

    const renderSkeleton = (key: string | number) => (
        <motion.div
            key={key}
            className="w-full h-[40vh] md:h-[55vh] bg-neutral-800 animate-pulse rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
    );

    return (
        <>
            {mediaInInfoBox && (
                <MediaInfoBox
                    isExpanded={true}
                    media={mediaInInfoBox}
                    onClose={() => setMediaInInfoBox(null)}
                />
            )}

            {!userId ? (
                <div className="flex flex-col items-center justify-center text-center text-white py-20 space-y-6 px-4">
                    <h1 className="text-2xl font-semibold">You must be logged in to vote</h1>
                    <p className="max-w-md text-sm text-gray-400">
                        This feature allows you to vote between two photos or videos to help surface the best media.
                        Voting is anonymous and improves the gallery experience.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => requireLogin()}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded transition"
                        >
                            Log in
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <AnimatePresence>
                        {heart && (
                            <motion.div
                                key="heart"
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
                            >
                                <div
                                    className="absolute text-white text-5xl select-none"
                                    style={{
                                        top: heart.y,
                                        left: heart.x,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                >
                                    ❤️
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-10 text-white flex flex-col items-center justify-center p-4 space-y-3 relative">
                        <h1 className="text-2xl md:text-4xl md:my-20 my-10 font-semibold text-center text-white drop-shadow-lg">
                            Vote for your Favorite ❤️
                        </h1>

                        <div className="w-full max-w-screen-xl flex-1 flex items-center justify-center">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-h-full">
                                {loading
                                    ? [0, 1].map((i) => renderSkeleton(`skeleton-${i}`))
                                    : votePair &&
                                    [votePair.media1, votePair.media2].map((media) => (
                                        <div key={media.media_id}>{renderMedia(media)}</div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <FavoriteVote />
                    <VoteHistory />
                </>
            )}
        </>
    );
};

export default VotingPage;

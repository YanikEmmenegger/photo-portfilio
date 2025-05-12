import { FC, useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext.tsx";
import { Media } from "../types/types.ts";
import VotePhoto from "../components/Vote/VotePhoto.tsx";
import { AnimatePresence, motion } from "framer-motion";
import VoteHistory from "../components/Vote/VoteHistory.tsx";
import FavoriteVote from "../components/Vote/FavoriteVote.tsx";

const VotingPage: FC = () => {
    const { votePair, submitVote } = useUser();
    const [loading, setLoading] = useState(true);
    const [heart, setHeart] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        setLoading(!votePair);
    }, [votePair]);

    const handleVote = async (e: React.MouseEvent<HTMLDivElement>, selected: Media) => {
        const x = e.clientX;
        const y = e.clientY;

        setHeart({ x, y });

        setTimeout(() => setHeart(null), 700); // Remove heart after animation

        await submitVote(selected.media_id!);
    };

    const renderMedia = (media: Media) => (
        <div
            key={media.media_id}
            className="w-full h-[45vh] md:h-[80vh] flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={(e) => handleVote(e, media)}
        >
            <VotePhoto photo={media} />
        </div>
    );

    return (
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
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 space-y-4 relative">
            <h1 className="text-2xl md:text-4xl font-semibold text-center text-white drop-shadow-lg">
                Pick your favorite?
            </h1>

            <div className="w-full max-w-screen-xl flex-1 flex items-center justify-center">
                {loading ? (
                    <h2 className="text-xl text-gray-300">Loading...</h2>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-h-full">
                        {votePair && [votePair.media1, votePair.media2].map(renderMedia)}
                    </div>
                )}
            </div>

            {/* Heart animation container */}

        </div>
            <FavoriteVote/>
           <VoteHistory/>
            </>
    );
};

export default VotingPage;

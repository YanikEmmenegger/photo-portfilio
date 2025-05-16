import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiHeartFill, RiHeartLine } from "react-icons/ri";
import { Media } from "../../types/types";
import { useUser } from "../../contexts/UserContext.tsx";
import {twMerge} from "tailwind-merge";
import {isMobile} from "pixi.js";

interface MediaInfoBoxProps {
    media: Media;
    onClose: () => void;
    isExpanded?: boolean;
}

const MediaInfoBox: FC<MediaInfoBoxProps> = ({ media, onClose, isExpanded = false }) => {
    const [activeTab, setActiveTab] = useState<"media" | "info">("media");
    const [expanded, setExpanded] = useState<boolean>(isExpanded);
    const [likesCount, setLikesCount] = useState<number>(media.likes ?? 0);

    const isVideo = media.extension === ".mp4";
    const { likedImageIDs, addLikedImage, removeLikedImage } = useUser();
    const isLiked = !!media.media_id && likedImageIDs.includes(media.media_id);

    const toggleLike = async () => {
        if (!media.media_id) return;
        const success = isLiked
            ? await removeLikedImage(media.media_id)
            : await addLikedImage(media.media_id);

        if (success) {
            setLikesCount((prev) => prev + (isLiked ? -1 : 1));
        }
    };

    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.replace(/\/?$/, "/");
    const imageUrl = `${BASE_URL}${media.filename}-big${media.extension}`;
    const videoUrl = `${BASE_URL}${media.filename}${media.extension}`;

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderMedia = () =>
        isVideo ? (
            <video src={videoUrl} controls className="w-full h-full object-contain" />
        ) : (
            <img src={imageUrl} alt={media.title} className="w-full h-full object-contain" />
        );

    const renderInfo = () => (
        <>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{media.title}</h2>
            {media.description && <p className="mb-2 text-gray-300">{media.description}</p>}
            {media.captureDate && (
                <p className="mb-2 text-gray-400">
                    <strong>Capture Date:</strong> {formatDate(media.captureDate)}
                </p>
            )}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={toggleLike} className="focus:outline-none">
                    {isLiked ? (
                        <RiHeartFill className="text-red-500" size={24} />
                    ) : (
                        <RiHeartLine className="text-gray-400" size={24} />
                    )}
                </button>
                <span className="text-gray-400">{likesCount}</span>
            </div>
            {media.gpsInfos && (
                <div className="mb-2 text-gray-400">
                    <strong>Location:</strong>
                    <p>
                        Lat: {media.gpsInfos.latitude}, Long: {media.gpsInfos.longitude}
                        <a
                            href={`https://www.google.com/maps?q=${media.gpsInfos.latitude},${media.gpsInfos.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline ml-2"
                        >
                            View on Map
                        </a>
                    </p>
                </div>
            )}
            {media.keywords && media.keywords?.length > 0 && (
                <div className="mt-2">
                    <strong>Keywords:</strong>
                    <div className="flex flex-wrap mt-1">
                        {media.keywords.map((keyword, i) => (
                            <span
                                key={`keyword-${i}`}
                                className="mr-2 mb-2 bg-gray-800 text-gray-200 px-3 py-1 rounded-full"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 bg-black md:bg-black/80 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    key="modal"
                    className="w-full max-w-[2000px] mx-4 bg-black rounded-lg overflow-hidden relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-end p-2">
                        <button onClick={onClose} className={twMerge("text-3xl text-gray-300 hover:text-gray-100", isMobile && "hidden")}>
                            <RiCloseLine />
                        </button>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex h-[90vh]">
                        <div
                            className={`relative p-4 bg-black flex items-center justify-center transition-all duration-200 ${
                                expanded ? "w-full" : "w-1/2"
                            }`}
                        >
                            {renderMedia()}
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                                >
                                    {expanded ? "Show Info" : "Expand"}
                                </button>
                            </div>
                        </div>
                        {!expanded && (
                            <div className="p-6 w-1/2 overflow-y-auto text-gray-200">{renderInfo()}</div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                        <div className="flex border-b border-gray-700">
                            {["media", "info"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as "media" | "info")}
                                    className={`flex-1 py-2 text-center ${
                                        activeTab === tab
                                            ? "border-b-2 border-blue-500 font-bold text-gray-200"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 h-[90vh] overflow-y-auto bg-black text-gray-200">
                            {activeTab === "media" ? renderMedia() : renderInfo()}
                        </div>
                    </div>
                </motion.div>
                {/* Mobile Close Button */}
                <div className="fixed md:bottom-15 bottom-5 cursor-pointer  left-1/2 transform -translate-x-1/2 z-50">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 text-white px-6 py-2 rounded-full shadow-lg hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaInfoBox;

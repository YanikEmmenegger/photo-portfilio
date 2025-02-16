// MediaInfoBox.tsx
import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Media } from "../../types/types";
import { RiCloseLine, RiHeartFill, RiHeartLine } from "react-icons/ri";
import {useUser} from "../../contexts/UserContext.tsx";

interface MediaInfoBoxProps {
    media: Media;
    onClose: () => void;
    isExpanded?: boolean;
}

const MediaInfoBox: FC<MediaInfoBoxProps> = ({ media, onClose, isExpanded }) => {
    const [activeTab, setActiveTab] = useState<"media" | "info">("media");
    const [_isExpanded, set_isExpanded] = useState(isExpanded);
    const [likesCount, setLikesCount] = useState<number>(media.likes ?? 0);
    const isVideo = media.extension === ".mp4";

    const { likedImageIDs, addLikedImage, removeLikedImage } = useUser();

    // Determine if the current media is liked by the user
    const isLiked = media.media_id ? likedImageIDs.includes(media.media_id) : false;

    // Toggle the like status for this media
    const toggleLike = async () => {
        if (!media.media_id) return;
        if (isLiked) {
            const success = await removeLikedImage(media.media_id);
            if (success) {
                setLikesCount((prev) => prev - 1);
            }
        } else {
            const success = await addLikedImage(media.media_id);
            if (success) {
                setLikesCount((prev) => prev + 1);
            }
        }
    };

    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith("/")
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const imageUrl = `${BASE_URL}${media.filename}-big${media.extension}`;
    const videoUrl = `${BASE_URL}${media.filename}${media.extension}`;

    // Helper to format capture date as "DAY, dd. MONTH yyyy"
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${dayName}, ${day}. ${month} ${year}`;
    };

    // Variants for the outer modal (whole box) animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 25 },
        },
        exit: { scale: 0.8, opacity: 0 },
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black md:bg-opacity-80 z-50 flex items-center justify-center"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose} // Close modal when clicking backdrop
            >
                <motion.div
                    className="w-full max-w-[2000px] mx-4 bg-black rounded-lg overflow-hidden relative"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-2">
                        <button
                            onClick={onClose}
                            className="text-3xl text-gray-300 hover:text-gray-100"
                        >
                            <RiCloseLine />
                        </button>
                    </div>

                    {/* Desktop View: Two-column layout with expand/show info effect */}
                    <div className="hidden md:flex h-[90vh]">
                        {/* Media Column */}
                        <motion.div
                            initial={false} // Disable initial animation on mount
                            animate={{ width: _isExpanded ? "100%" : "50%" }}
                            transition={{ duration: 0.1 }}
                            className="relative p-4 bg-black flex items-center justify-center"
                        >
                            {isVideo ? (
                                <video
                                    src={videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={imageUrl}
                                    alt={media.title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                            <div className="absolute top-2 right-2">
                                {_isExpanded ? (
                                    <button
                                        onClick={() => set_isExpanded(false)}
                                        className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Show Info
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => set_isExpanded(true)}
                                        className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Expand
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Info Column */}
                        <motion.div
                            initial={false} // Disable initial animation on mount
                            animate={{
                                width: _isExpanded ? "0%" : "50%",
                                opacity: _isExpanded ? 0 : 1,
                            }}
                            transition={{ duration: 0.1 }}
                            className="p-6 overflow-y-auto text-gray-200"
                        >
                            <h2 className="text-3xl font-bold mb-4">{media.title}</h2>
                            {media.description && (
                                <p className="mb-4 text-gray-300">{media.description}</p>
                            )}
                            {media.captureDate && (
                                <p className="mb-2 text-gray-400">
                                    <strong>Capture Date:</strong> {formatDate(media.captureDate)}
                                </p>
                            )}
                            {/* Like Button with Heart Icon */}
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
                                <div className="mb-4 text-gray-400">
                                    <strong>Location:</strong>
                                    <p>
                                        Lat: {media.gpsInfos.latitude}, Long: {media.gpsInfos.longitude}{" "}
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
                            {media.keywords && media.keywords.length > 0 && (
                                <div className="mt-4">
                                    <strong>Keywords:</strong>
                                    <div className="flex flex-wrap mt-1">
                                        {media.keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="mr-2 mb-2 bg-gray-800 text-gray-200 px-3 py-1 rounded-full"
                                            >
                        {keyword}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Mobile View: Fullscreen Tabbed Interface (no expand button) */}
                    <div className="md:hidden">
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab("media")}
                                className={`flex-1 py-2 text-center ${
                                    activeTab === "media"
                                        ? "border-b-2 border-blue-500 font-bold text-gray-200"
                                        : "text-gray-400"
                                }`}
                            >
                                Media
                            </button>
                            <button
                                onClick={() => setActiveTab("info")}
                                className={`flex-1 py-2 text-center ${
                                    activeTab === "info"
                                        ? "border-b-2 border-blue-500 font-bold text-gray-200"
                                        : "text-gray-400"
                                }`}
                            >
                                Info
                            </button>
                        </div>
                        {activeTab === "media" ? (
                            <div className="relative p-4 h-[90vh] bg-black flex items-center justify-center">
                                {isVideo ? (
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={imageUrl}
                                        alt={media.title}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="p-4 h-[90vh] overflow-y-auto bg-black text-gray-200">
                                <h2 className="text-2xl font-bold mb-2">{media.title}</h2>
                                {media.description && (
                                    <p className="mb-2 text-gray-300">{media.description}</p>
                                )}
                                {media.captureDate && (
                                    <p className="mb-2 text-gray-400">
                                        <strong>Capture Date:</strong> {formatDate(media.captureDate)}
                                    </p>
                                )}
                                {/* Like Button for Mobile */}
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
                                    <div className="mb-4 text-gray-400">
                                        <strong>Location:</strong>
                                        <p>
                                            Lat: {media.gpsInfos.latitude}, Long: {media.gpsInfos.longitude}{" "}
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
                                {media.keywords && media.keywords.length > 0 && (
                                    <div className="mt-2">
                                        <strong>Keywords:</strong>
                                        <div className="flex flex-wrap mt-1">
                                            {media.keywords.map((keyword, index) => (
                                                <span
                                                    key={index}
                                                    className="mr-2 mb-2 bg-gray-800 text-gray-200 px-3 py-1 rounded-full"
                                                >
                          {keyword}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MediaInfoBox;

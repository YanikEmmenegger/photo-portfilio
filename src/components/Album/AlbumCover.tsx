import {FC, useEffect, useState} from "react";
import { Album } from "../../types/types.ts";
import { TextEffect } from "../effects/TextEffect.tsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AlbumCoverProps {
    album: Album;
}

const AlbumCover: FC<AlbumCoverProps> = ({ album }) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const originalUrl = `${BASE_URL}${album.cover_photo.filename}-big${album.cover_photo.extension}`;

    // State to manage the loading state of the image
    const [isLoaded, setIsLoaded] = useState(false);
    const [showTextEffect, setShowTextEffect] = useState(false);

    // Event handler for image load
    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    // Use effect to trigger the rendering of the TextEffect after the image has faded in
    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                setShowTextEffect(true);
            }, 500); // Delay to ensure image has fully faded in before rendering text effect

            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

    return (
        <div className="relative max-w-2xl">
            <Link to={`/album/${album.album_id}`}>
                <motion.img
                    src={originalUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    loading="lazy"
                />
                {isLoaded && (
                    <motion.div
                        className="absolute flex items-center justify-center inset-0 bg-black hover:bg-opacity-60 bg-opacity-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                    >
                        {showTextEffect && (
                            <TextEffect per={"word"} preset={"slide"} className="text-2xl text-white">
                                {album.title}
                            </TextEffect>
                        )}
                    </motion.div>
                )}
            </Link>
        </div>
    );
};

export default AlbumCover;

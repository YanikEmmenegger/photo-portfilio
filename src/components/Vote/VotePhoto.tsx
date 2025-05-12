import {FC, useState} from "react";
import {Media} from "../../types/types.ts";
import {motion} from "framer-motion";

interface Props {
    photo: Media;
}

const VotePhoto: FC<Props> = ({photo}) => {
    const [loaded, setLoaded] = useState(false);

    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const middleUrl = `${BASE_URL}${photo.filename}${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}-big${photo.extension}`;

    return (
        <div className="relative w-full h-full overflow-hidden hover:border-0 border-2 border-black">
            {thumbnailUrl && (
                <img
                    src={thumbnailUrl}
                    alt="Blur placeholder"
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-105"
                />
            )}

            {middleUrl && (
                <img
                    src={middleUrl}
                    alt="Preview"
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                        loaded ? "opacity-0" : "opacity-100"
                    }`}
                />
            )}

            {originalUrl && (
                <motion.img
                    key={photo.media_id} // ensures animation re-triggers on photo change
                    src={originalUrl}
                    alt={photo.title || "Photo"}
                    onLoad={() => setLoaded(true)}
                    initial={{opacity: 0, scale: 0.98}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.5, ease: "easeOut"}}
                    className="relative z-10 w-full h-full object-contain"
                />
            )}
        </div>
    );
};

export default VotePhoto;

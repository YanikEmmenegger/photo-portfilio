import { FC, useState, useEffect } from "react";
import { Media } from "../../types/types.ts";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface AlbumGalleryProps {
    media: Media;
    index: number;
    onClick?: () => void;
}

const AlbumMedia: FC<AlbumGalleryProps> = ({ media, index, onClick }) => {
    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const [src, setSrc] = useState("");
    const [thumbnailSrc, setThumbnailSrc] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (media.extension === ".mp4") {
            setSrc(`${BASE_URL}${media.filename}${media.extension}`);
            setThumbnailSrc(`${BASE_URL}${media.filename}-thumb.jpg`);
        } else {
            setSrc(`${BASE_URL}${media.filename}-big${media.extension}`);
            setThumbnailSrc(`${BASE_URL}${media.filename}-thumb${media.extension}`);
        }
    }, [BASE_URL, media.extension, media.filename]);

    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: index === 0 ? 0.01 : 0.1,
    });


    useEffect(() => {
        if (!isLoaded) {
            if (media.extension === ".mp4") {
                const video = document.createElement("video");
                video.src = src;
                video.addEventListener("loadeddata", () => {
                    setIsLoaded(true);
                });
            } else {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    setIsLoaded(true);
                }
            }
        }
    }, [isLoaded, media.extension, src]);

    // Determine text alignment based on layout direction
    const isTextLeftAligned = index % 2 === 0;

    return (
        <motion.div
            ref={ref}
            className={twMerge(
                "w-full my-40 flex flex-col md:flex-row items-start",
                isTextLeftAligned ? "md:flex-row" : "md:flex-row-reverse"
            )}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50, scale: inView ? 1 : 0.8 }}
            transition={{ duration: 0.5}}
        >
            <div
                className={twMerge(
                    "flex-1 flex flex-col justify-center px-5 md:py-0 py-5",
                    isTextLeftAligned ? "text-left" : "text-right" // Conditional text alignment
                )}
            >
                <h2 className="text-3xl font-bold mb-2">{media.title}</h2>
                <p className="text-xl md:text-2xl">{media.description}</p>
                <p>{media.keywords?.join(", ")}</p>
            </div>
            <div className="flex-1 w-full max-w-full">
                {
                    media.extension === ".mp4" ? (
                        isLoaded ? (<video
                            className="w-full h-auto object-contain md:max-h-[80vh]"
                            src={src}
                            controls></video>) : (
                            <img
                                className="w-full h-auto object-contain md:max-h-[80vh]"
                                src={thumbnailSrc}
                                alt={media.title}/>
                        )
                    ) : (
                        <img onClick={onClick}
                             className="w-full h-auto object-contain md:max-h-[80vh]"
                             src={isLoaded ? src : thumbnailSrc}
                             alt={media.title}
                        />
                    )
                }
            </div>
        </motion.div>
    );
};

export default AlbumMedia;

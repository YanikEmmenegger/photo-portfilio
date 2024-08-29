import { FC, useState, useEffect } from "react";
import { Photo } from "../../types/types.ts";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface AlbumGalleryProps {
    photo: Photo;
    index: number;
}

const AlbumPhoto: FC<AlbumGalleryProps> = ({ photo, index }) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const normalUrl = `${BASE_URL}${photo.filename}${photo.extension}`;
    const bigUrl = `${BASE_URL}${photo.filename}-big${photo.extension}`;
    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;

    const [imageSrc, setImageSrc] = useState(thumbnailUrl);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMediumOrLarger, setIsMediumOrLarger] = useState(window.innerWidth >= 768);

    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: index === 0 ? 0.01 : 0.1,
    });

    const updateWindowSize = () => {
        setIsMediumOrLarger(window.innerWidth >= 768);
    };

    useEffect(() => {
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    useEffect(() => {
        if (inView && !isLoaded) {
            const img = new Image();
            const selectedUrl = isMediumOrLarger ? bigUrl : normalUrl;

            img.src = selectedUrl;
            img.onload = () => {
                setImageSrc(selectedUrl);
                setIsLoaded(true);
            };
        }
    }, [inView, bigUrl, normalUrl, isLoaded, isMediumOrLarger]);

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
                <h2 className="text-3xl font-bold mb-2">{photo.title}</h2>
                <p className="text-xl md:text-2xl">{photo.description}</p>
                <p>{photo.keywords?.join(", ")}</p>
            </div>
            <div className="flex-1 w-full max-w-full">
                <img
                    className="w-full h-auto object-contain md:max-h-[80vh]"
                    src={imageSrc}
                    alt={photo.title}
                />
            </div>
        </motion.div>
    );
};

export default AlbumPhoto;

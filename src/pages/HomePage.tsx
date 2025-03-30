import { useEffect, useState } from 'react';
import { useImageContext } from '../contexts/BackgroundImageContext.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { fetchPhotosWithFilter } from "../utils/supabaseService.ts";
import { TextEffect } from "../components/effects/TextEffect.tsx";

const HomePage = () => {
    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;
    const {
        images,
        currentImageIndex,
        setImages,
        setCurrentImageIndex
    } = useImageContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (images.length > 0) {
            setLoading(false);
            return;
        }
        const loadImages = async () => {
            const newPhotos = await fetchPhotosWithFilter({ filterType: "background" });
            if (!newPhotos || newPhotos.length === 0) {
                setImages([]);
            } else {
                setImages(newPhotos);
            }
            setLoading(false);
        };
        loadImages();
    }, [images, setImages]);

    useEffect(() => {
        if (images.length === 0) return;

        const preloadNextMedia = () => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            const nextMedia = images[nextIndex];
            const imgUrlPrefix = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
            if (nextMedia.extension === ".mp4") {
                // Preload video
                const video = document.createElement("video");
                video.src = `${imgUrlPrefix}${nextMedia.filename}${nextMedia.extension}`;
            } else {
                // Preload image
                const img = new Image();
                img.src = `${imgUrlPrefix}${nextMedia.filename}-big${nextMedia.extension}`;
            }
        };

        const interval = setInterval(() => {
            preloadNextMedia();
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 5000); // Change media every 5 seconds

        return () => clearInterval(interval);
    }, [images, currentImageIndex, setCurrentImageIndex, BASE_URL]);

    const imgUrlPrefix = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const currentMedia = images[currentImageIndex];

    return (
        <>
            {loading ? (
                <div className="w-full h-screen fixed top-0 left-0 z-50 flex items-center justify-center bg-black text-white text-3xl">
                    <span>Loading...</span>
                </div>
            ) : (
                <AnimatePresence>
                    {currentMedia.extension === ".mp4" ? (
                        <motion.video
                            key={currentImageIndex}
                            className="w-full h-screen fixed top-0 left-0 -z-10 object-cover pointer-events-none"
                            src={`${imgUrlPrefix}${currentMedia.filename}${currentMedia.extension}`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                                const videoElement = e.currentTarget;
                                // Set video to a random start time between 0 and duration
                                videoElement.currentTime = Math.random() * videoElement.duration;
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    ) : (
                        <motion.div
                            key={currentImageIndex}
                            className="w-full h-screen fixed top-0 left-0 -z-10 bg-cover bg-center pointer-events-none"
                            style={{
                                backgroundImage: `url('${imgUrlPrefix}${currentMedia.filename}-big${currentMedia.extension}')`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    )}
                    {/* Overlay for title and keywords with a lower z-index so Navigation stays clickable */}
                    <div className="flex flex-col items-center justify-center h-screen fixed top-0 w-screen bg-black/20 p-4 -z-10">
                        <motion.h1
                            className="text-white text-6xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1, ease: "easeInOut" }}
                        >
                            <TextEffect per={"char"} preset="blur">
                                {currentMedia.title!}
                            </TextEffect>
                        </motion.h1>
                        <div className="text-white text-center flex justify-center flex-wrap items-center text-2xl">
                            {currentMedia.keywords &&
                                currentMedia.keywords.map((keyword, index, arr) => (
                                    <Link
                                        key={index}
                                        className="hover:underline text-center"
                                        to={`/images/?keywords=${keyword}`}
                                    >
                                        <TextEffect
                                            per={"char"}
                                            className="inline-block border-b-2 border-transparent hover:border-white"
                                            preset="slide"
                                        >
                                            {`${keyword}${index < arr.length - 1 ? ", " : ""}`}
                                        </TextEffect>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </AnimatePresence>
            )}
        </>
    );
};

export default HomePage;

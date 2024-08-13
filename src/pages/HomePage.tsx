import {useEffect, useState} from 'react';
import {useImageContext} from '../contexts/ImageContext';
import {motion, AnimatePresence} from 'framer-motion';
import {fetchRandomLandscapeImages} from "../utils/photoService.ts";
import {Link} from "react-router-dom";

const HomePage = () => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
    const {images, currentImageIndex, setImages, setCurrentImageIndex} = useImageContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (images.length > 0) {
            setLoading(false);
            return;
        }

        const loadImages = async () => {
            const fetchedImages = await fetchRandomLandscapeImages(50); // Number of images to retrieve
            if (fetchedImages) {
                setImages(fetchedImages);
            }
            setLoading(false);
        };

        loadImages();
    }, [images, setImages]);

    useEffect(() => {
        if (images.length === 0) return;

        const preloadNextImage = () => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            const nextImage = images[nextIndex];
            const img = new Image();
            img.src = `${BASE_URL}${nextImage.filename}-big${nextImage.extension}`;
        };

        const interval = setInterval(() => {
            preloadNextImage(); // Start preloading the next image
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 10000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [images, setCurrentImageIndex, currentImageIndex]);

    const imgUrlPrefix = 'https://yanik.pro/photo';
    const currentImage = images[currentImageIndex];
    const backgroundImage = currentImage
        ? `url('${imgUrlPrefix}/${currentImage.filename}-big${currentImage.extension}')`
        : '';

    return (
        <>
            {loading ? (
                <div
                    className="w-full h-screen fixed top-0 left-0 z-50 flex items-center justify-center bg-black text-white text-3xl">
                    <span>Loading...</span>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        key={currentImageIndex}
                        className="w-full h-screen fixed top-0 left-0 -z-10 bg-cover bg-center"
                        style={{backgroundImage}}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 1, ease: "easeInOut"}}
                    >
                        <div className="flex flex-col items-center justify-center h-full bg-black bg-opacity-20 p-4">
                            <motion.h1
                                className="text-white text-6xl"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 1, ease: "easeInOut"}}
                            >
                                {currentImage.description}
                            </motion.h1>
                            <motion.h2
                                className="text-white text-2xl"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 1, ease: "easeInOut"}}
                            >
                                {
                                    currentImage.keywords.map((keyword, index) => (
                                        <span key={index}>
                                            {index > 0 && ', '}
                                            <Link className={"hover:underline"} to={`/search/?keywords=${keyword}`}>{keyword}</Link>
                                        </span>
                                    ))
                                }
                            </motion.h2>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </>
    );
};

export default HomePage;

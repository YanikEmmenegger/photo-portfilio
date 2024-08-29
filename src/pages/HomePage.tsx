import {useEffect, useState} from 'react';
import {useImageContext} from '../contexts/BackgroundImageContext.tsx';
import {motion, AnimatePresence} from 'framer-motion';
import {Link} from "react-router-dom";
import {fetchPhotosWithFilter} from "../utils/supabaseService.ts";
import {TextEffect} from "../components/effects/TextEffect.tsx";

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
            const newPhotos = await fetchPhotosWithFilter({filterType: "background"}) // Number of images to retrieve
            if (newPhotos === null || newPhotos.length === 0) {
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

        const preloadNextImage = () => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            const nextImage = images[nextIndex];
            const img = new Image();
            img.src = `${BASE_URL}${nextImage.filename}-big${nextImage.extension}`;
        };

        const interval = setInterval(() => {
            preloadNextImage(); // Start preloading the next image
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 4000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [images, setCurrentImageIndex, currentImageIndex, BASE_URL]);

    const imgUrlPrefix = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
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
                                transition={{duration: 0.1, ease: "easeInOut"}}
                            >

                                <TextEffect per={"char"} preset='blur'>
                                    {currentImage.title!}
                                </TextEffect>
                                {/*{currentImage.title}*/}
                            </motion.h1>

                            <div className="text-white text-center flex justify-center flex-wrap items-center text-2xl" >

                                {
                                    currentImage.keywords?.length !=0 &&  currentImage.keywords!.map((keyword, index) => (
                                        <Link key={index} className={"hover:underline text-center"}
                                              to={`/images/?keywords=${keyword}`}>
                                            <TextEffect per={"char"}
                                                        className={"float-left border-b-2 border-transparent hover:border-white"}
                                                        preset="slide">
                                                {keyword + ", "}
                                            </TextEffect>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </>
    );
};

export default HomePage;

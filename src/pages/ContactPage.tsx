import {AnimatePresence, motion} from "framer-motion";
import Social from "../components/Social.tsx";
import {CiInstagram, CiLinkedin, CiMail} from "react-icons/ci";
import {SlSocialGithub} from "react-icons/sl";
import {useImageContext} from "../contexts/BackgroundImageContext.tsx";
import {useEffect, useState} from "react";
import {fetchPhotosWithFilter} from "../utils/supabaseService.ts";
import {TextEffect} from "../components/effects/TextEffect.tsx";

const ContactPage = () => {


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
        }, 60000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [images, setCurrentImageIndex, currentImageIndex, BASE_URL]);

    const imgUrlPrefix = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const currentImage = images[currentImageIndex];
    const backgroundImage = currentImage
        ? `url('${imgUrlPrefix}/${currentImage.filename}-big${currentImage.extension}')`
        : '';

    return (<>
            {loading ? (
                <div
                    className="w-full h-screen fixed top-0 left-0 z-50 flex items-center justify-center bg-black text-white text-3xl">
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    <AnimatePresence>
                        <motion.div
                            key={currentImageIndex}
                            className="w-full h-screen backdrop-blur blur-lg fixed top-0 left-0 -z-10 bg-cover bg-center"
                            style={{backgroundImage}}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 1, ease: "easeInOut"}}
                        >

                        </motion.div>
                    </AnimatePresence>
                    <div
                        className="flex flex-col -z-10 w-screen items-center fixed left-0 top-0 justify-center h-screen b g-black bg-opa city-80 p-4">

                    </div>
                    <div
                        className="w-full fixed h-screen flex-col top-0 left-0 -z-10 flex items-center justify-center bg-black bg-opacity-40 text-white text-5xl">
                        <TextEffect per='word' as='h3' preset='blur' className={"pb-5"}>
                            Contact
                        </TextEffect>
                        <div
                            className="flex flex-wrap md:flex-row w-full mx-auto gap-14 md:gap-10 justify-center items-center">
                            <Social index={1} Icon={CiInstagram} name={"Instagram"}
                                    url={"https://instagram.com/yanik.ee"}/>
                            <Social index={2} Icon={CiLinkedin} name={"Linkedin"}
                                    url={"https://www.linkedin.com/in/yanik-emmenegger/"}/>
                            <Social index={3} Icon={SlSocialGithub} name={"Github"}
                                    url={"https://github.com/YanikEmmenegger"}/>
                            <Social index={4} Icon={CiMail} name={"Email"} url={"mailto:emmenegger@yanik.pro"}/>
                        </div>
                    </div>
                </>

            )}
        </>
    );
};

export default ContactPage;

import {FC, useState, useEffect, useCallback} from "react";
import {CgClose} from "react-icons/cg";
import {motion, AnimatePresence} from "framer-motion";
import {Photo} from "../../types/types.ts";
import {IoIosArrowUp} from "react-icons/io";
import {twMerge} from "tailwind-merge";
import {BsArrowLeft, BsArrowRight} from "react-icons/bs";
import {useUser} from "../../contexts/UserContext.tsx";

interface LightboxProps {
    photos: Photo[];
    currentIndex: number;
    closeLightbox: () => void;
}

const Lightbox: FC<LightboxProps> = ({photos, currentIndex, closeLightbox}) => {
    const [current, setCurrent] = useState<number>(currentIndex);
    const [isLoading, setIsLoading] = useState(true);
    const [openInfos, setOpenInfos] = useState(false);
    const {lightboxInstructions, setLightboxInstructions} = useUser();



    useEffect(() => {
        if (!lightboxInstructions) {
            setTimeout(() => {
                setLightboxInstructions(true);
            }, 1000);
        }
    }, [lightboxInstructions, setLightboxInstructions]);

    const photo = photos[current];
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const bigUrl = `${BASE_URL}${photo.filename}-big${photo.extension}`;

    const handleNext = useCallback(() => {
        setIsLoading(true);
        setCurrent((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const handlePrev = useCallback(() => {
        setIsLoading(true);
        setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeLightbox();
            }
            if (e.key === "ArrowRight") {
                handleNext();
            }
            if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeydown);
        const handleResize = () => {
            if (window.innerWidth < 640) {
                closeLightbox();
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("resize", handleResize);
        };
    }, [closeLightbox, handleNext, handlePrev]);

    return (
        <>

            <AnimatePresence>
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-40"
                    onClick={(e) => e.currentTarget === e.target && closeLightbox()}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.3}}>
                    <button
                        className="absolute top-4 right-4 bg-white text-black z-50 rounded-full p-2 text-xl"
                        onClick={closeLightbox}>
                        <CgClose/>
                    </button>
                    <div className="absolute flex flex-col items-center w-[90%] h-[90%] max-w-full max-h-full">
                        <div className="relative flex items-center mt-[10%] md:mt-0 justify-center overflow-hidden">
                            <motion.img
                                src={bigUrl}
                                alt={photo.description}
                                className={`max-w-full max-h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                                onLoad={() => setIsLoading(false)}
                            />
                            <motion.div
                                        className={twMerge(
                                            "absolute border-r-2 border-black border-opacity-50 flex items-center justify-center cursor-w-resize transition-opacity h-full left-0 w-1/2 bg-black z-40",
                                            lightboxInstructions ? "opacity-0" : "opacity-50"
                                        )}
                                        onClick={handlePrev}
                                        aria-label="Previous"
                                        transition={{opacity: {duration: 0.5}}}
                            >
                                <BsArrowLeft className="text-9xl"/>
                            </motion.div>
                            <motion.div
                                        className={twMerge(
                                            "absolute flex items-center justify-center cursor-e-resize h-full right-0 w-1/2 bg-black z-40 transition-opacity",
                                            lightboxInstructions ? "opacity-0" : "opacity-50"
                                        )}
                                        onClick={handleNext}
                                        aria-label="Next"
                                        transition={{opacity: {duration: 0.5}}}
                            >
                                <BsArrowRight className="text-9xl"/>
                            </motion.div>
                            <div className="absolute flex w-full h-full ">
                                {photo.description !== '' && window.innerWidth >= 640 && (
                                    <>
                                        <motion.div
                                            className="bg-black bg-opacity-70 z-50 flex flex-col gap-1 p-5 h-full"
                                            initial={{opacity: 0, y: 500}}
                                            animate={openInfos ? {opacity: 1, y: 0} : {opacity: 0, y: 500}}
                                            transition={{duration: 0.3}}
                                        >
                                            <div className="flex-1 gap-2 flex flex-col ">
                                                <h1 className="text-3xl font-semibold">{photo.title}</h1>
                                                <p className=" text-sm md:text-lg">{photo.description}</p>
                                                <p className="text-sm">
                                                    {/* Show capture date in format DD. MMMM YYYY */}
                                                    {new Date(photo.captureDate!).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-sm">
                                                    Keywords: {photo.keywords!.join(", ")}
                                                </p>
                                                <p className="text-sm">
                                                    Location:
                                                    <a
                                                        href={`https://www.google.com/maps/place/${photo.gpsInfos!.latitude},${photo.gpsInfos!.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        {photo.gpsInfos!.latitude}, {photo.gpsInfos!.longitude}
                                                    </a>
                                                </p>

                                            </div>
                                            <div className="mt-auto">
                                                <button
                                                    className="p-2 w-full text-xl"
                                                    onClick={() => setOpenInfos(false)}
                                                >
                                                    Close Information's
                                                </button>
                                            </div>
                                        </motion.div>
                                        <motion.div
                                            onClick={() => setOpenInfos(!openInfos)}
                                            initial={{opacity: 1}}
                                            animate={openInfos ? {opacity: 0} : {opacity: 1}}
                                            transition={{duration: 0.3}}
                                            className="absolute text flex flex-col z-50 cursor-pointer justify-center items-center text-center w-full left-0 bottom-0 text-xl pb-10"
                                        >
                                            <IoIosArrowUp/> Open Information's
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default Lightbox;

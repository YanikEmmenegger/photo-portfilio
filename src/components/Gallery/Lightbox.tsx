import {FC, useState, useEffect, useCallback} from "react";
import {CgClose} from "react-icons/cg";
import {motion, AnimatePresence} from "framer-motion";
import {Photo} from "../../types/types.ts";
import {IoIosArrowUp} from "react-icons/io";

interface LightboxProps {
    photos: Photo[];
    currentIndex: number;
    closeLightbox: () => void;
}

const Lightbox: FC<LightboxProps> = ({photos, currentIndex, closeLightbox}) => {
    const [current, setCurrent] = useState<number>(currentIndex);
    const [isLoading, setIsLoading] = useState(true);

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
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-30"
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
                <div className="absolute flex flex-col items-center w-[90%]  h-[90%] max-w-full max-h-full">
                    {/* Container for image and description */}
                    {/* Image Container */}
                    <div className="relative flex items-center mt-[10%] md:mt-0 justify-center overflow-hidden">
                        <motion.img
                            src={bigUrl}
                            alt={photo.description}
                            className={`${isLoading ? 'hidden' : 'block'} max-w-full max-h-full object-contain`}
                            onLoad={() => setIsLoading(false)}
                            initial={{opacity: 0}}
                            animate={{opacity: isLoading ? 0 : 1}}
                            transition={{duration: 0.5}}
                        />
                        <div className={"absolute w-full flex flex-col h-full"}>
                            <div className={"relative grow"}>
                                <button
                                    className="relative cursor-w-resize inset-y-0 h-full left-0 w-1/2 grow bg-transparent z-40"
                                    onClick={handlePrev}
                                    aria-label="Previous"
                                >
                                    {/* Invisible button over left half of the image */}
                                </button>

                                {/* Next Button */}
                                <button
                                    className="relative cursor-e-resize inset-y-0 right-0 h-full w-1/2 grow bg-transparent z-40"
                                    onClick={handleNext}
                                    aria-label="Next"
                                >
                                    {/* Invisible button over right half of the image */}
                                </button>
                            </div>
                            {photo.description !== '' && window.innerWidth >= 640 && (
                                <>
                                    <div
                                        className={"absolute text flex flex-col justify-center items-center text-center w-full left-0 bottom-0 text-xl pb-10"}>
                                        <IoIosArrowUp/>open description
                                    </div>
                                    <motion.div
                                        className="relative bg-black bg-opacity-90  p-5 flex flex-row items-end top-0 right-0 z-60"
                                        initial={{opacity: 0, y: 20}}
                                        whileHover={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <p className="text-xl">{photo.description}</p>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Previous Button */}

                </div>
                {/* Close Button */}
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;

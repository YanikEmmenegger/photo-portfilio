import {FC, useState, useEffect, useCallback} from "react";
import {CgClose} from "react-icons/cg";
import {motion, AnimatePresence} from "framer-motion";
import {Photo} from "../../types/types.ts";
import {twMerge} from "tailwind-merge";

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

    // Handle the next image
    const handleNext = useCallback(() => {
        setIsLoading(true);
        setCurrent((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    // Handle the previous image
    const handlePrev = useCallback(() => {
        setIsLoading(true);
        setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    // Handle keydown events for navigation and closing Lightbox
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

        // Handle window resize
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
                onClick={(e) => e.currentTarget === e.target && closeLightbox()} // Close on overlay click
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3}}
            >
                <div className="relative flex justify-center items-center w-[90%] h-[90%] max-w-full max-h-full"
                     onClick={closeLightbox}>
                    {/* Small Image as a placeholder */}
                    {/*<motion.img*/}
                    {/*    src={smallUrl}*/}
                    {/*    alt={photo.description}*/}
                    {/*    className={`blur-lg ${isLoading ? 'block' : 'hidden'} max-w-full max-h-full object-contain`}*/}
                    {/*    initial={{opacity: 1}}*/}
                    {/*    animate={{opacity: isLoading ? 1 : 0}}*/}
                    {/*    transition={{duration: 0.3}}*/}
                    {/*/>*/}
                    <h1
                        className={twMerge("text-2xl text-center text-white z-50 absolute top-4 w-full", isLoading ? 'block' : 'hidden')}
                    >
                        {photo.title}...
                    </h1>
                    {/* Large Image */}
                    <motion.img
                        src={bigUrl}
                        alt={photo.description}
                        className={`${isLoading ? 'hidden' : 'block'} max-w-full max-h-full object-contain`}
                        onLoad={() => setIsLoading(false)}
                        initial={{opacity: 0, size: 0}}
                        animate={{opacity: isLoading ? 0 : 1, size: isLoading ? 0 : 1}}
                        transition={{duration: 0.5}}
                    />

                </div>
                <button
                    className="absolute top-4 right-4 bg-white text-black z-50 rounded-full p-2 text-xl"
                    onClick={closeLightbox}
                >
                    <CgClose/>
                </button>

                {/* Previous Button */}
                <button
                    className="absolute xl:pl-40 inset-y-0 left-1/4 flex items-center z-40 justify-start w-1/4 cursor-w-resize text-white text-3xl"
                    onClick={handlePrev}
                    aria-label="Previous"
                >
                    {/*<span className={"text-4xl"}>{"<"}</span>*/}
                </button>

                {/* Next Button */}
                <button
                    className="absolute xl:pr-40 inset-y-0 justify-end right-1/4 flex items-center z-40 w-1/4 cursor-e-resize text-white text-3xl"
                    onClick={handleNext}
                    aria-label="Next"
                >
                    {/*<span className={"text-4xl"}>{">"}</span>*/}
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default Lightbox;

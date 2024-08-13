import {FC, useState} from "react";
import {CgClose} from "react-icons/cg";
import {motion} from "framer-motion";

interface LightboxProps {
    smallUrl: string;
    bigUrl: string;
    alt: string;
    closeLightbox: () => void;
    isLandscape: boolean;
}

const Lightbox: FC<LightboxProps> = ({smallUrl, bigUrl, alt, closeLightbox, isLandscape}) => {
    const [isLoading, setIsLoading] = useState(true);


    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            onClick={(e) => e.currentTarget === e.target && closeLightbox()} // Close on overlay click
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.3}}>
            <div className="flex justify-center items-center w-[80%] h-[80%] ">
                {/* Small Image as a placeholder */}
                <motion.img
                    src={smallUrl}
                    alt={alt}
                    className={` blur-lg ${isLoading ? 'block' : 'hidden'} ${isLandscape ? 'w-full h-auto' : 'w-auto h-full'}`}
                    initial={{opacity: 1}}
                    animate={{opacity: isLoading ? 1 : 0}}
                    transition={{duration: 0.3}}
                />
                {/* Large Image */}
                <motion.img
                    src={bigUrl}
                    alt={alt}
                    className={` ${isLoading ? 'hidden' : 'block'} ${isLandscape ? 'w-full h-auto' : 'w-auto h-full'}`}
                    onLoad={() => setIsLoading(false)}
                    initial={{opacity: 0}}
                    animate={{opacity: isLoading ? 0 : 1}}
                    transition={{duration: 0.3}}
                />
                <button className="absolute top-4 right-4 bg-white text-black rounded-full p-2 text-xl"
                        onClick={closeLightbox}>
                    <CgClose/>
                </button>

            </div>

        </motion.div>
    );
};

export default Lightbox;

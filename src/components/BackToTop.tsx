import {useEffect, useState} from 'react';
import {AiOutlineArrowUp} from "react-icons/ai";
import {motion} from 'framer-motion';

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Show button after scrolling down the height of the entire page
        setIsVisible(scrollPosition > windowHeight);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.div
            onClick={scrollToTop}
            className={`fixed cursor-pointer flex bottom-4 right-4 z-30 p-5 justify-center items-center gap-2 bg-blue-600 text-white rounded-full shadow-lg`}
            title="Back to Top"
            aria-label="Back to Top"
            initial={{opacity: 0, y: 50}}
            animate={{opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50}}
            transition={{duration: 0.5}}
        >
            <p className={"hidden md:block"}>Back to Top</p> <AiOutlineArrowUp/>
        </motion.div>
    );
};

export default BackToTopButton;

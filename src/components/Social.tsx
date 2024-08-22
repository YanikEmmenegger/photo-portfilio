import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconType } from "react-icons";

interface SocialProps {
    url: string;
    Icon: IconType;
    index: number;
    name: string;
}

const Social: FC<SocialProps> = ({ url, Icon, name, index }) => {
    // Utility function to return a random positive or negative value
    const getRandomRotation = () => {

        //index is even or odd
        if (index % 2 === 0) {
            return -20;
        } else {
            return 20;
        }
    }

    return (
        <a href={url} id={name} target="_blank" rel="noopener noreferrer">
            <AnimatePresence>
                <motion.div
                    key="outline"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{
                        scale: 1.2,
                        rotate: getRandomRotation(),  // Random rotation direction
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(8px)",
                        transition: { duration: 0.1, ease: "easeInOut" },
                    }}
                    whileTap={{ scale: 1.1 }}
                    className="border-2 border-white rounded-full p-6 md:p-8 flex items-center justify-center cursor-pointer"
                >
                    <Icon className="text-3xl md:text-5xl text-white" />
                </motion.div>
            </AnimatePresence>
        </a>
    );
};

export default Social;

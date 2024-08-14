import {FC} from "react";
import {AiFillHeart, AiOutlineHeart, AiOutlineLoading} from "react-icons/ai";
import {motion, AnimatePresence} from "framer-motion";

interface LikeButtonProps {
    isLiked: boolean;
    onclick: () => void;
    loading?: boolean;
}

const LikeButton: FC<LikeButtonProps> = ({isLiked, onclick, loading}) => {
    return (
        <div
            onClick={loading ? undefined : onclick} // Disable click when loading
            className="relative cursor-pointer flex items-center justify-center"
            style={{width: 24, height: 24}} // Ensure the button has a fixed size
        >
            {loading ? (
                <motion.div
                    key="loading"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={{duration: 0.25, ease: "easeInOut"}}
                    className="absolute flex items-center justify-center"
                >
                    <AiOutlineLoading className="text-gray-500 animate-spin" size={24}/>
                </motion.div>
            ) : (
                <AnimatePresence>
                    {isLiked ? (
                        <motion.div
                            key="filled"
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.8}}
                            transition={{duration: 0.25, ease: "easeInOut"}}
                            className="absolute flex items-center justify-center"
                        >
                            <AiFillHeart className="text-red-500" size={24}/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="outline"
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.8}}
                            transition={{duration: 0.25, ease: "easeInOut"}}
                            className="absolute flex items-center justify-center"
                        >
                            <AiOutlineHeart size={24}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default LikeButton;

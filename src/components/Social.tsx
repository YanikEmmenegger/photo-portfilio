import {FC} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {IconType} from "react-icons";

interface SocialProps {
    url: string;
    Icon: IconType;
    name: string;
}

const Social: FC<SocialProps> = ({url, Icon, name}) => {
    return (
        <a href={url} id={name} target="_blank" >
            <AnimatePresence>
                <motion.div
                    key="outline"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={{duration: 0.25, ease: "easeInOut"}}
                    className="border-2 border-white rounded-full p-10 flex items-center justify-center"
                >
                    <Icon className={"text-5xl"}/>
                </motion.div>
            </AnimatePresence>
        </a>
    );
};

export default Social;

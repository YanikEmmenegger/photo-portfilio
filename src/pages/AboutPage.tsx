import { motion } from "framer-motion";
import {TextEffect} from "../components/effects/TextEffect.tsx";
import {Link} from "react-router-dom";

const AlbumPage = () => {
    return (
        <div className="w-full h-screen flex-col gap-3 fixed top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-4xl">
            <TextEffect per='word' as='h1' preset='blur'>
                nothing about, just photos.
            </TextEffect>
            <motion.div
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1}}>
                <Link to={"/images"} className="px-4 py-2 rounded-full text-xl bg-blue-500 text-white">
                    Show Images
                </Link>
            </motion.div>
        </div>
    );
};

export default AlbumPage;

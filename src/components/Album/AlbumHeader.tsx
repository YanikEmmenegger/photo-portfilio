import {FC} from "react";
import {Photo} from "../../types/types.ts";
import {motion} from "framer-motion";
import {TextEffect} from "../effects/TextEffect.tsx";

interface AlbumHeaderProps {
    title: string;
    description: string;
    coverPhoto: Photo;
}

const AlbumHeader: FC<AlbumHeaderProps> = ({title, coverPhoto, description}) => {

    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const backgroundImage =
        `url('${BASE_URL}${coverPhoto.filename}-big${coverPhoto.extension}')`


    return (
        <div className={"flex relative h-screen top-0 left-0"}>
            <motion.div
                className="w-full h-screen absolute top-0 left-0 -z-10 bg-cover bg-center"
                style={{backgroundImage}}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 1, ease: "easeInOut"}}>
            </motion.div>
            <div
                className={"bg-black bg-opacity-50 -z-10 grow w-screen top-0 left-0 flex flex-col justify-center items-center"}>
                <span className={"max-w-4xl -mt-20 w-full p-10"}>
                    <TextEffect per={"word"} preset={"slide"} className={"text-xl font-semibold sm:text-4xl lg:text-6xl"}>{title}</TextEffect>
                    <motion.h1
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 1}}
                    >{description}</motion.h1>
                </span>
            </div>

        </div>
    );
}

export default AlbumHeader;
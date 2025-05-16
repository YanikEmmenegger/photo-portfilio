import {FC, useState} from "react";
import {Media} from "../../types/types.ts";
import {motion} from "framer-motion";

interface Props {
    video: Media;
}

const VoteVideo: FC<Props> = ({video}) => {
    const [loaded, setLoaded] = useState(false);

    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const videoUrl = `${BASE_URL}${video.filename}${video.extension}`;

    return (
        <div className="relative w-full h-full overflow-hidden">
            <motion.video
                key={video.media_id}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                onCanPlayThrough={() => setLoaded(true)}
                initial={{opacity: 0, scale: 0.98}}
                animate={{opacity: loaded ? 1 : 0, scale: 1}}
                transition={{duration: 0.5, ease: "easeOut"}}
                className="relative z-10 w-full h-full object-contain"
            />
            {!loaded && (
                <div className="absolute inset-0 bg-black animate-pulse"/>
            )}
        </div>
    );
};

export default VoteVideo;

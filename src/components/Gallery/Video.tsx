import { FC, useEffect, useRef, useState } from "react";
import { Media } from "../../types/types";
import { RiFullscreenFill, RiInfoI, RiPauseFill, RiPlayMiniFill } from "react-icons/ri";

interface VideoProps {
    video: Media;
    onClick?: () => void;
    onInfoClick?: () => void;
}

const Video: FC<VideoProps> = ({ video, onInfoClick, onClick }) => {
    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    const blurredThumbnailUrl = `${BASE_URL}${video.filename}-thumb.jpg`;
    const normalThumbnailUrl = `${BASE_URL}${video.filename}.jpg`;
    const videoUrl = `${BASE_URL}${video.filename}${video.extension}`;

    // State variables
    const [isPlaying, setIsPlaying] = useState(false);
    const [fullVideoLoaded, setFullVideoLoaded] = useState(false);
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const [timesPlayed, setTimesPlayed] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadFullVideo = () => {
            if (!fullVideoLoaded && videoRef.current) {
                videoRef.current.setAttribute("preload", "auto");
                videoRef.current.load();
                setFullVideoLoaded(true);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setHasIntersected(true);
                        observer.disconnect();
                        loadFullVideo();
                    }
                });
            },
            { threshold: 0.1 }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [fullVideoLoaded]);

    // Toggle play/pause without resetting currentTime.
    const handlePlayPause = async () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            await videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    // Loop the video until it has played three times, then reset.
    const handleVideoEnded = () => {
        if (timesPlayed < 2) {
            setTimesPlayed((prev) => prev + 1);
            videoRef.current?.play();
        } else {
            setTimesPlayed(0);
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setHasStarted(false);
            }
        }
    };

    // When the video plays for the first time, mark it as started.
    const handleTimeUpdate = () => {
        if (videoRef.current && !hasStarted && videoRef.current.currentTime > 0) {
            setHasStarted(true);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative group overflow-hidden cursor-pointer"
            style={{ aspectRatio: `${video.size?.width} / ${video.size?.height}` }}
        >
            {hasIntersected && (
                <video onClick={onClick}
                    ref={videoRef}
                    src={videoUrl}
                    preload={hasIntersected ? (fullVideoLoaded ? "auto" : "metadata") : "none"}
                    playsInline
                    muted
                    onEnded={handleVideoEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: isPlaying || videoRef.current?.currentTime !==0 ? 1 : 0 }}
                />
            )}
            {/* Blurred thumbnail: visible only if not loaded and video has not started */}
            <img
                src={blurredThumbnailUrl}
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: (!thumbnailLoaded && !hasStarted && !isPlaying) ? 1 : 0 }}
            />
            {/* Normal thumbnail: visible if loaded and video has not started */}
            <img
                src={normalThumbnailUrl}
                onClick={onClick}
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: (!isPlaying && !hasStarted) ? 1 : 0 }}
                onLoad={() => setThumbnailLoaded(true)}
            />
            {/* Info button: hidden by default, appears on hover always on sm */}
            <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 flex items-center gap-2 z-10">
                <button
                    onClick={onInfoClick}
                    className=" bg-black/50 text-white p-2 rounded-full"
                >
                    <RiInfoI />
                </button>
            </div>
            {/* Controls overlay */}
            <div
                className={`absolute bottom-2 right-2 flex items-center gap-2 z-10 ${
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
            >
                <button
                    onClick={handlePlayPause}
                    className="bg-black/50 text-white p-2 rounded-full"
                >
                    {isPlaying ? <RiPauseFill /> : <RiPlayMiniFill />}
                </button>
                {isPlaying && (
                    <button
                        onClick={handleFullscreen}
                        className=" bg-black/50 text-white p-2 rounded-full"
                    >
                        <RiFullscreenFill />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Video;

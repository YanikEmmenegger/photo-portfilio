import {FC} from "react";
import {Album} from "../../types/types.ts";
import {TextEffect} from "../effects/TextEffect.tsx";
import {Link} from "react-router-dom";

interface AlbumCoverProps {
    album: Album;
}

const AlbumCover: FC<AlbumCoverProps> = ({album}) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const originalUrl = `${BASE_URL}${album.cover_photo.filename}-big${album.cover_photo.extension}`;

    return (

        <div className="relative max-w-2xl">
            <Link to={"/album/" + album.album_id}>
                <img
                    src={originalUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className={"absolute flex items-center justify-center inset-0 bg-black hover:bg-opacity-60 bg-opacity-30"}>
                    <TextEffect className="text-2xl text-white">
                        {album.title}
                    </TextEffect>
                </div>
            </Link>

        </div>
    );
};

export default AlbumCover;

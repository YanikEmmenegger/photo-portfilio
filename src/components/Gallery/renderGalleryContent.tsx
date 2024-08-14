import {FC} from "react";
import {AiOutlineLoading} from "react-icons/ai";
import {Link} from "react-router-dom";
import PhotoGallery from "./PhotoGallery.tsx";
import {Photo} from "../../types/types.ts";

interface RenderGalleryContentProps {
    loading: boolean;
    error: string | null;
    photos: Photo[];
    header: string;
    text?: string;
    showAllImages?: boolean;
}

const RenderGalleryContent: FC<RenderGalleryContentProps> = ({loading, photos, error, text, header, showAllImages}) => {

    const renderContent = () => {
        if (loading) return <div
            className="w-full h-screen fixed flex-col top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-3xl">
            <AiOutlineLoading className={"animate-spin mb-5"} fontSize={"70px"}/>Loading...</div>;
        if (error) return <div
            className="w-full h-screen fixed top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-3xl">
            {error}</div>;
        if (photos.length === 0) return <div
            className="w-full h-screen flex-col fixed text-center top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-xl md:text-3xl">
            {header}
            <p className={"text-sm pb-10 pt-3"}>{text || ""}</p>
            {showAllImages &&
                <Link to={"/images"} className="px-4 py-2 rounded-full text-xl font-bold bg-blue-500 text-white">
                Show Images
                </Link>
            }
        </div>;

        return <PhotoGallery photos={photos} loading={loading}/>;
    };

    return (
        <>
            {renderContent()}
        </>
    );
}

export default RenderGalleryContent;
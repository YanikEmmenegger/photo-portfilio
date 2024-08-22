import {TextEffect} from "../components/effects/TextEffect.tsx";

const AlbumPage = () => {
    return (
        <div className="w-full h-screen fixed top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-3xl">
            <TextEffect per={'char'} preset={'blur'}>
                Coming soon...
            </TextEffect>
        </div>
    );
};

export default AlbumPage;

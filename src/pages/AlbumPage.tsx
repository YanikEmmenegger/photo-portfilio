import {useEffect, useState} from "react";
import {Album} from "../types/types.ts";
import {fetchAlbums} from "../utils/supabaseService.ts";
import {twMerge} from "tailwind-merge";
import AlbumCover from "../components/Album/AlbumCover.tsx";

const AlbumPage = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [maxCols, setMaxCols] = useState(1); // Default to 1 to handle initial render
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all albums
        fetchAlbums().then((albums) => {
            setAlbums(albums);
            setLoading(false);
            // Set maxCols based on the number of albums
            setMaxCols(albums.length < 2 ? 1 : albums.length >= 4 ? 4 : 2);
        });
    }, []);

    return (


        <div className="mt-10 p-10 flex justify-center">
             {loading ? (
                 <p>Loading...</p>
             ) : (
                 <div
                     className={twMerge(
                         "grid grid-cols-1 sm:grid-cols-2 gap-3 justify-items-center",
                         `md:grid-cols-${maxCols}`
                     )}
                 >
                     {albums.length > 0 ? (
                         albums.map((album) => (
                             <AlbumCover key={album.album_id} album={album} />
                         ))
                     ) : (
                         <p>No albums available</p>
                     )}
                 </div>
             )}
         </div>
    );
};

export default AlbumPage;

import {FC} from "react";
import {motion} from "framer-motion";

interface SortComponentProps {
    sortMode: "Newest" | "Oldest" | "Random";
    onSortModeChange: (newSortMode: "Newest" | "Oldest" | "Random") => void;
}

const SortComponent: FC<SortComponentProps> = ({
                                                   sortMode,
                                                   onSortModeChange,
                                               }) => {
    const handleSortModeChange = (newSortMode: "Newest" | "Oldest") => {
        onSortModeChange(newSortMode);
    };

    return (
        <div className="flex flex-col items-start justify-start gap-4">
            <div className="flex flex-wrap gap-2 justify-center rounded-full bg-blue-400 p-2">
                {["Newest", "Oldest"].map((mode) => (
                    <motion.button
                        key={mode}
                        data-id={mode}
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.8}}
                        transition={{duration: 0.3, ease: "easeInOut"}}
                        className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-colors ${
                            sortMode === mode
                                ? "bg-gray-500 text-white"
                                : "bg-gray-200 text-black hover:bg-gray-500 hover:text-white"
                        }`}
                        onClick={() => handleSortModeChange(mode as "Newest" | "Oldest")}
                    >
                        {mode}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default SortComponent;

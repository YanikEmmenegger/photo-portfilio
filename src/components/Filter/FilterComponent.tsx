import {FC, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import KeywordFilter from "./KeywordFilter.tsx";
import {motion} from "framer-motion";
import {twMerge} from "tailwind-merge";

interface FilterComponentProps {
    onClose: () => void;
}

const FilterComponent: FC<FilterComponentProps> = ({onClose}) => {
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [KeywordFilterMode, setKeywordFilterMode] = useState<"AND" | "OR">("OR");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract filters from URL query parameters
        const query = new URLSearchParams(location.search);
        const keywordsFromQuery = query.get("keywords")?.split(";") || [];
        const filterModeFromQuery = query.get("KeywordFilterMode") === "AND" ? "AND" : "OR";

        setSelectedKeywords(keywordsFromQuery);
        setKeywordFilterMode(filterModeFromQuery || "OR");
    }, [location.search]);

    const applyFilters = () => {
        const query = new URLSearchParams();
        if (selectedKeywords.length > 0) {
            query.set("keywords", selectedKeywords.join(";"));
        }
        query.set("KeywordFilterMode", KeywordFilterMode);

        navigate({search: query.toString()}, {replace: true});
        onClose(); // Close the filter component after applying
    };

    const cancelFilters = () => {
        onClose(); // Just close the filter component without applying any changes
    };

    const clearFilters = () => {
        setSelectedKeywords([]);
        setKeywordFilterMode("OR");
    }

    const removeSelectedKeyword = (keyword: string) => {
        setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.1}}
            className="w-screen top-0 flex justify-center items-center h-screen bg-black bg-opacity-75 fixed z-50"
        >
            <motion.div
                initial={{opacity: 0, y: -50}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -50}}
                transition={{duration: 0.2}}
                className="p-10 w-screen md:max-w-[75%] lg:max-w-[50%] h-screen md:h-auto md:max-h-screen rounded-2xl bg-black flex flex-col justify-between overflow-y-auto"
            >
                <div>
                    {selectedKeywords.length > 0 && (
                        <div className="mb-4 hidden">
                            <h2 className="text-lg font-bold mb-2">Selected Keywords:</h2>
                            <div className="flex flex-wrap gap-2">
                                {selectedKeywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm cursor-pointer"
                                        onClick={() => removeSelectedKeyword(keyword)}
                                    >
                                        {keyword} ×
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <KeywordFilter
                        selectedKeywords={selectedKeywords}
                        setSelectedKeywords={setSelectedKeywords}
                        filterMode={KeywordFilterMode}
                        setFilterMode={setKeywordFilterMode}
                    />
                </div>

                <div className="flex justify-end p-2 items-center gap-2 mt-4">
                    <button
                        className="px-4 py-2 rounded-full text-sm font-bold bg-blue-500 text-white"
                        onClick={applyFilters}
                    >
                        Apply Filter
                    </button>
                    <button
                        className="px-4 py-2 rounded-full text-sm font-bold bg-red-500 text-white"
                        onClick={cancelFilters}
                    >
                        Cancel
                    </button>
                    <button
                        className={twMerge("px-4 py-2 rounded-full text-sm font-bold bg-gray-500 text-white", selectedKeywords.length === 0 && "hidden")}
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FilterComponent;

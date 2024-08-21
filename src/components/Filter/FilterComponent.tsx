import {FC, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import KeywordFilter from "./KeywordFilter";
import {motion} from "framer-motion";
import SortComponent from "./SortComponent.tsx";

interface FilterComponentProps {
    onClose: () => void;
}

const FilterComponent: FC<FilterComponentProps> = ({onClose}) => {
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [filterMode, setFilterMode] = useState<"AND" | "OR">("OR");
    const [sortMode, setSortMode] = useState<"Newest" | "Oldest" | "Random">("Newest");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const keywordsFromQuery = query.get("keywords")?.split(";") || [];
        const filterModeFromQuery = query.get("KeywordFilterMode") === "AND" ? "AND" : "OR";
        const sortModeFromQuery = query.get("sort") || "Newest";

        setSelectedKeywords(keywordsFromQuery);
        setFilterMode(filterModeFromQuery || "OR");

        const validSortModes = ["Newest", "Oldest", "Random"];
        if (validSortModes.includes(sortModeFromQuery)) {
            setSortMode(sortModeFromQuery as "Newest" | "Oldest" | "Random");
        } else {
            setSortMode("Newest");
        }
    }, [location.search]);

    const applyFilters = () => {
        const query = new URLSearchParams();
        if (selectedKeywords.length > 0) {
            query.set("keywords", selectedKeywords.join(";"));
        }
        query.set("KeywordFilterMode", filterMode);
        query.set("sort", sortMode); // Ensure sortMode is set in the query parameters

        navigate({search: query.toString()}, {replace: true});
        onClose(); // Close the filter component after applying
    };

    const cancelFilters = () => {
        onClose(); // Just close the filter component without applying any changes
    };

    const clearFilters = () => {
        setSelectedKeywords([]);
        setFilterMode("OR");
        setSortMode("Newest"); // Reset to default sort mode
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.1}}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50"
        >
            <motion.div
                initial={{opacity: 0, y: -50}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -50}}
                transition={{duration: 0.2}}
                className="p-10 w-full h-full md:h-[80%] md:h -auto max-w-3xl bg-black rounded-2xl flex flex-col justify-between overflow-y-auto"
            >
                <SortComponent
                    sortMode={sortMode}
                    onSortModeChange={(newSortMode) => setSortMode(newSortMode)}
                />
                <KeywordFilter
                    selectedKeywords={selectedKeywords}
                    setSelectedKeywords={setSelectedKeywords}
                    filterMode={filterMode}
                    setFilterMode={setFilterMode}
                />
                <div className="flex justify-end pb-20 md:pb-2 gap-2 mt-4">
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
                    {selectedKeywords.length > 0 && (
                        <button
                            className="px-4 py-2 rounded-full text-sm font-bold bg-gray-500 text-white"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FilterComponent;

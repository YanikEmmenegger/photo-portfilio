import {FC, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {fetchAllKeywords} from "../utils/supabaseService.ts";

const FilterComponent: FC = () => {
    const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [filterMode, setFilterMode] = useState<"AND" | "OR">("AND"); // Default to "AND"

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch available keywords from your API
        const fetchKeywords = async () => {
            try {
                setAvailableKeywords(await fetchAllKeywords());
            } catch (error) {
                console.error("Error fetching keywords", error);
            }
        };

        fetchKeywords();
    }, []);

    useEffect(() => {
        // Get current keywords and filter mode from the URL query
        const query = new URLSearchParams(location.search);
        const keywordsFromQuery = query.get("keywords")?.split(";") || [];
        const filterModeFromQuery = query.get("mode") === "OR" ? "OR" : "AND";

        setSelectedKeywords(keywordsFromQuery);
        setFilterMode(filterModeFromQuery);
    }, [location.search]);

    const toggleKeyword = (keyword: string) => {
        const newSelectedKeywords = selectedKeywords.includes(keyword)
            ? selectedKeywords.filter((k) => k !== keyword)
            : [...selectedKeywords, keyword];

        setSelectedKeywords(newSelectedKeywords);

        // Update URL query parameters without pushing to history
        const query = new URLSearchParams(location.search);
        if (newSelectedKeywords.length > 0) {
            query.set("keywords", newSelectedKeywords.join(";"));
        } else {
            query.delete("keywords");
        }
        query.set("mode", filterMode); // Ensure the mode is preserved in the URL

        navigate({search: query.toString()}, {replace: true});
    };

    const toggleFilterMode = () => {
        const newFilterMode = filterMode === "AND" ? "OR" : "AND";
        setFilterMode(newFilterMode);

        // Update URL query parameters without pushing to history
        const query = new URLSearchParams(location.search);
        query.set("mode", newFilterMode);
        navigate({search: query.toString()}, {replace: true});
    };

    return (
        <div className="p-4">
            <div className="flex justify-center flex-wrap gap-2 mb-4">
                {availableKeywords.map((keyword) => (
                    <button
                        key={keyword}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                            selectedKeywords.includes(keyword)
                                ? "bg-blue-600 text-white hover:line-through"
                                : "bg-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white"
                        }`}
                        onClick={() => toggleKeyword(keyword)}
                    >
                        {keyword}
                    </button>
                ))}
            </div>
            <div className="flex justify-center items-center gap-2">
                <label className="font-semibold">Filter Mode:</label>
                <button
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                        filterMode === "AND" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                    onClick={toggleFilterMode}
                >
                    {filterMode === "AND" ? "AND" : "OR"}
                </button>
            </div>
        </div>
    );
};

export default FilterComponent;

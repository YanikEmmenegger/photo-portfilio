import {FC, useEffect, useState} from "react";
import {fetchAllKeywords} from "../../utils/supabaseService.ts";
import KeywordGroup from "./KeywordGroup.tsx";
import {motion} from "framer-motion";
import {debounce} from "lodash";

interface KeywordFilterProps {
    selectedKeywords: string[];
    setSelectedKeywords: (keywords: string[]) => void;
    filterMode: "AND" | "OR";
    setFilterMode: (mode: "AND" | "OR") => void;
}

const KeywordFilter: FC<KeywordFilterProps> = ({
                                                   selectedKeywords,
                                                   setSelectedKeywords,
                                                   filterMode,
                                                   setFilterMode,
                                               }) => {
    const [groupedKeywords, setGroupedKeywords] = useState<Map<string, string[]>>(new Map());
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const keywords = await fetchAllKeywords();

                const grouped = new Map<string, string[]>();
                keywords.forEach(({keyword, keyword_groups}) => {
                    const groupName = keyword_groups;
                    if (!grouped.has(groupName)) {
                        grouped.set(groupName, []);
                    }
                    grouped.get(groupName)!.push(keyword);
                });

                setGroupedKeywords(grouped);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching keywords", error);
            }
        };

        fetchKeywords();
    }, []);

    const toggleKeyword = (keyword: string) => {
        const newSelectedKeywords = selectedKeywords.includes(keyword)
            ? selectedKeywords.filter((k) => k !== keyword)
            : [...selectedKeywords, keyword];

        setSelectedKeywords(newSelectedKeywords);
    };

    const selectAllKeywords = (group: string) => {
        const groupKeywords = groupedKeywords.get(group) || [];
        const newSelectedKeywords = new Set(selectedKeywords);

        groupKeywords.forEach((keyword) => newSelectedKeywords.add(keyword));

        setSelectedKeywords(Array.from(newSelectedKeywords));
    };

    const deselectAllKeywords = (group: string) => {
        const groupKeywords = groupedKeywords.get(group) || [];
        const newSelectedKeywords = selectedKeywords.filter(
            (keyword) => !groupKeywords.includes(keyword)
        );

        setSelectedKeywords(newSelectedKeywords);
    };

    const toggleFilterMode = () => {
        const newFilterMode = filterMode === "AND" ? "OR" : "AND";
        setFilterMode(newFilterMode);
    };

    const handleSearchDebounced = debounce((query: string) => {
        setSearchQuery(query);
    }, 500);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleSearchDebounced(event.target.value);
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
        >
            {!loading && (
                <div className="flex p-2 flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <h1 className="text-xl md:text-4xl">Filter by Keywords:</h1>
                        <button
                            className={`md:px-4 md:py-2 px-2 py-1 rounded-full text-sm font-bold ${
                                filterMode === "AND" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                            }`}
                            onClick={toggleFilterMode}
                        >
                            {filterMode === "AND" ? "AND" : "OR"}
                        </button>
                    </div>

                    {selectedKeywords.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-lg font-bold mb-2">Selected Keywords:</h2>
                            <motion.div layout className="flex flex-wrap gap-2">
                                {selectedKeywords.map((keyword) => (
                                    <motion.span
                                        layout
                                        key={keyword}
                                        initial={{opacity: 0, scale: 0.8}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.8}}
                                        className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm cursor-pointer"
                                        onClick={() => toggleKeyword(keyword)}
                                    >
                                        {keyword} ×
                                    </motion.span>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    <input
                        type="text"
                        className="p-2 hidden border border-gray-300 rounded-md"
                        placeholder="Search keywords..."
                        onChange={handleSearch}
                    />

                    {Array.from(groupedKeywords.entries()).map(([group, keywords]) => {
                        // Filter keywords based on the search query and selected keywords
                        const filteredKeywords = keywords.filter(
                            (keyword) =>
                                keyword.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                !selectedKeywords.includes(keyword)
                        );

                        // Render the group even if it has no selectable keywords
                        return (
                            <KeywordGroup
                                key={group}
                                group={group}
                                keywords={filteredKeywords}
                                selectedKeywords={selectedKeywords}
                                toggleKeyword={toggleKeyword}
                                selectAll={() => selectAllKeywords(group)}
                                deselectAll={() => deselectAllKeywords(group)}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default KeywordFilter;

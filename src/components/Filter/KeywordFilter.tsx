import { FC, useEffect, useState } from "react";
import { fetchAllKeywords } from "../../utils/supabaseService";
import KeywordGroup from "./KeywordGroup";
import FilterModeSwitch from "./FilterModeSwitch";
import { motion } from "framer-motion";
import Keyword from "./Keyword.tsx";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

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

    // Apply debounce to search query
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const keywords = await fetchAllKeywords();
                const grouped = new Map<string, string[]>();

                keywords.forEach(({ keyword, keyword_groups }) => {
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {!loading && (
                <div className="flex flex-col gap-4">
                    <div className="flex-col gap-2 items-center">
                        <h1 className="text-xl md:text-2xl">Filter by Keywords:</h1>
                        <FilterModeSwitch
                            filterMode={filterMode}
                            toggleFilterMode={() => setFilterMode(filterMode === "AND" ? "OR" : "AND")}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedKeywords.map((keyword) => (
                            <Keyword
                                name={keyword}
                                isSelected={true}
                                onClick={() => toggleKeyword(keyword)}
                                key={keyword}
                            />
                        ))}
                    </div>

                    <input
                        type="text"
                        className="p-2 border border-gray-300 rounded-md"
                        placeholder="Search keywords..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {Array.from(groupedKeywords.entries()).map(([group, keywords]) => {
                        const filteredKeywords = keywords.filter(
                            (keyword) =>
                                keyword.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
                                !selectedKeywords.includes(keyword)
                        );

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

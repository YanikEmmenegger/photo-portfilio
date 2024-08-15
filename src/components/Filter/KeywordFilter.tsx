import { FC, useEffect, useState } from "react";
import { fetchAllKeywords } from "../../utils/supabaseService.ts";
import KeywordGroup from "./KeywordGroup.tsx";
import { motion } from "framer-motion";

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
                                                   setFilterMode
                                               }) => {
    const [groupedKeywords, setGroupedKeywords] = useState<Map<string, string[]>>(new Map());
    const [loading, setLoading] = useState<boolean>(true);

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
        const newSelectedKeywords = selectedKeywords.filter((keyword) => !groupKeywords.includes(keyword));

        setSelectedKeywords(newSelectedKeywords);
    };

    const toggleFilterMode = () => {
        const newFilterMode = filterMode === "AND" ? "OR" : "AND";
        setFilterMode(newFilterMode);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
                    {Array.from(groupedKeywords.entries()).map(([group, keywords]) => (
                        <KeywordGroup
                            key={group}
                            group={group}
                            keywords={keywords}
                            selectedKeywords={selectedKeywords}
                            toggleKeyword={toggleKeyword}
                            selectAll={() => selectAllKeywords(group)}
                            deselectAll={() => deselectAllKeywords(group)}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default KeywordFilter;

import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface KeywordGroupProps {
    group: string;
    keywords: string[];
    selectedKeywords: string[];
    toggleKeyword: (keyword: string) => void;
}

const KeywordGroup: FC<KeywordGroupProps> = ({ group, keywords, selectedKeywords, toggleKeyword }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        // Initialize collapse state based on whether any keyword in the group is selected
        const hasSelectedKeyword = keywords.some(keyword => selectedKeywords.includes(keyword));
        setIsCollapsed(!hasSelectedKeyword);
    }, []); // Empty dependency array ensures this runs only on mount

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="rounded-lg py-2">
            <div
                className="flex gap-2 items-center cursor-pointer text-white font-semibold"
                onClick={toggleCollapse}
            >
                <span className="text-2xl">{group}</span>
                <motion.span
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    ▼
                </motion.span>
            </div>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                        <button
                            key={keyword}
                            className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                selectedKeywords.includes(keyword)
                                    ? "bg-blue-500 text-white hover:line-through"
                                    : "bg-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white"
                            }`}
                            onClick={() => toggleKeyword(keyword)}
                        >
                            {keyword}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default KeywordGroup;

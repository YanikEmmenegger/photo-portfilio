import { FC, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { twMerge } from "tailwind-merge";
import Keyword from "./Keyword"; // Adjust import path if necessary

interface KeywordGroupProps {
    group: string;
    keywords: string[];
    selectedKeywords: string[];
    toggleKeyword: (keyword: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
}

const KeywordGroup: FC<KeywordGroupProps> = ({
                                                 group,
                                                 keywords,
                                                 selectedKeywords,
                                                 toggleKeyword,
                                                 selectAll,
                                                 deselectAll,
                                             }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="rounded-lg">
            <div
                className="flex justify-between items-center w-full px-4 py-2 text-lg font-semibold text-left text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 cursor-pointer"
                onClick={handleToggle}
            >
                <span>{group}</span>
                <span className="flex items-center">
                    {isOpen ? (
                        <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                    )}
                </span>
            </div>

            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden px-4 pt-4 pb-2 text-sm text-gray-300"
            >
                <div className="flex flex-col md:gap-2 gap-2 mt-2">
                    <div className="flex justify-start gap-2 mb-2">
                        <button
                            className={twMerge(
                                "px-3 py-1 rounded-full bg-green-500 text-white text-sm",
                                keywords.length === 0 && "hidden"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                selectAll();
                            }}
                        >
                            Select All
                        </button>
                        <button
                            className={twMerge(
                                "px-3 py-1 rounded-full hidden bg-red-500 text-white text-sm",
                                selectedKeywords.length >= 1 && "block"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                deselectAll();
                            }}
                        >
                            Deselect All
                        </button>
                    </div>
                    <motion.div
                        className="flex flex-wrap md:gap-2 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {keywords.length === 0 ? (
                            <div className="text-gray-500">
                                No selectable keywords
                            </div>
                        ) : (
                            keywords.map((keyword) => (
                                <Keyword
                                    key={keyword}
                                    name={keyword}
                                    isSelected={selectedKeywords.includes(keyword)}
                                    onClick={() => toggleKeyword(keyword)}
                                />
                            ))
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default KeywordGroup;

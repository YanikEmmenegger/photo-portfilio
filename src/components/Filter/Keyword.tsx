import { FC } from "react";
import { motion } from "framer-motion";

interface KeywordProps {
    name: string;
    isSelected: boolean;
    onClick: () => void;
}

const Keyword: FC<KeywordProps> = ({ name, isSelected, onClick }) => {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                isSelected
                    ? "bg-blue-500 text-white hover:line-through"
                    : "bg-gray-200 text-black hover:bg-blue-600 hover:text-white"
            }`}
            onClick={onClick}
        >
            {name}
        </motion.button>
    );
};

export default Keyword;

import { FC } from "react";
import { Switch } from "@headlessui/react";
import {InformationCircleIcon} from "@heroicons/react/16/solid";

interface FilterModeSwitchProps {
    filterMode: "AND" | "OR";
    toggleFilterMode: () => void;
}

const FilterModeSwitch: FC<FilterModeSwitchProps> = ({ filterMode, toggleFilterMode }) => {
    return (
        <div className="flex pt-4 items-center gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Filter Mode
                <div className="relative group">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-black rounded-lg shadow-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p>
                            Use <strong>AND</strong> to match all keywords, or <strong>OR</strong> to match any keyword.
                        </p>
                    </div>
                </div>
            </label>
            <Switch
                checked={filterMode === "AND"}
                onChange={toggleFilterMode}
                className={`${
                    filterMode === "AND" ? "bg-green-500" : "bg-blue-500"
                } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
                <span
                    className={`${
                        filterMode === "AND" ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
            </Switch>
            <span className="text-sm font-medium text-gray-700">
                {filterMode === "AND" ? "AND" : "OR"}
            </span>
        </div>
    );
};

export default FilterModeSwitch;

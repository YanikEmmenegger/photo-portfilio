import {FC} from 'react';
import {Link} from 'react-router-dom';

interface DropdownProps {
    path: string;
    options: string[];
    isOpen: boolean;
    onDropdownClose: () => void;
}

const Dropdown: FC<DropdownProps> = ({options, path, isOpen, onDropdownClose}) => {
    return (
        <div
            className={`absolute left-1/2 transform -translate-x-1/2 mt-8 flex-col bg-black/100 border-2 border-white transition-all duration-300 ease-in-out ${
                isOpen ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-4'
            }`}
            onMouseLeave={onDropdownClose}
            style={{zIndex: 10}}
        >
            {options.map((option, index) => (
                <Link
                    key={index}
                    to={`${path}/${option}`}
                    className="text-xl text-white py-2 px-8 bg-black/0 hover:bg-black/100 hover:text-opacity-75 whitespace-nowrap"
                >
                    {option}
                </Link>
            ))}
        </div>
    );
};

export default Dropdown;

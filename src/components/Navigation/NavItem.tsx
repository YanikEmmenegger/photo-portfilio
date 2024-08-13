import { FC, useState, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import Dropdown from './Dropdown';

interface NavItemProps {
    name: string;
    href: string;
    active: boolean;
    dropDownOptions?: string[];
}

const NavItem: FC<NavItemProps> = ({ name, active, href, dropDownOptions }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleMouseEnter = () => setDropdownOpen(true);
    const handleMouseLeave = () => setDropdownOpen(false);

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        setDropdownOpen(prev => !prev);
    };

    return (
        <div
            className="relative flex flex-col"
            style={{ width: '120px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                to={href}
                className={`flex items-center justify-center hover:text-gray-300 text-xl lg:text-2xl transition-all duration-200 ease-in-out ${
                    active ? 'font-bold' : 'font-thin'
                }`}
                onClick={handleClick}
            >
                <p>{name}</p>
            </Link>
            {dropDownOptions && dropDownOptions.length >= 1 && (
                <Dropdown
                    path={href}
                    options={dropDownOptions}
                    isOpen={isDropdownOpen}
                    onDropdownClose={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default NavItem;
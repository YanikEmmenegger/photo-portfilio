import {FC} from 'react';
import {Link} from 'react-router-dom';
import {twMerge} from "tailwind-merge";

interface NavItemProps {
    children: React.ReactNode;
    href: string;
    active: boolean;
    onclick?: () => void;
}

const NavItem: FC<NavItemProps> = ({children, active, href, onclick}) => {
    return (
        <Link
            onClick={onclick}
            target={href.startsWith('http') ? '_blank' : '_self'}
            to={href}
            className={twMerge("flex items-center justify-center hover:text-gray-300 text-2xl md:text-xl lg:text-2xl transition-all duration-200 ease-in-out", active ? '' : '', href.includes("/world") && "hover:rotate-180" )}
        >
            {children}
        </Link>
    );
};

export default NavItem;

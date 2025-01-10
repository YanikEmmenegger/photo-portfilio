import {FC} from 'react';
import {Link} from 'react-router-dom';

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
            className={`flex items-center justify-center hover:text-gray-300 text-2xl md:text-xl lg:text-2xl transition-all duration-200 ease-in-out ${
                active ? '' : ''
            }`}
        >
            {children}
        </Link>
    );
};

export default NavItem;

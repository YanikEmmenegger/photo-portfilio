import {Link, useLocation} from 'react-router-dom';
import {useEffect} from 'react';
import NavItem from './NavItem';

const Navigation = () => {
    const location = useLocation();
    //const [albums, setAlbums] = useState<string[]>([]);

    useEffect(() => {
        // TODO: Replace with actual API call
        //setAlbums(["La Réunion", "Puerto Rico", "Costa Rica"]);
    }, []);

    const navItems = [
        {name: "Search", href: "/search"},
        {name: "Albums", href: "/albums", dropDownOptions: []},
        {name: "Contact", href: "/contact"},
    ];

    return (
        <div className="transition-opacity w-full h-auto p-10 pb-4 flex items-center justify-between">
            <Link to="/">
                <div className="hover:text-gray-300 transition-colors text-3xl lg:text-7xl">KINAY PHOTO</div>
            </Link>
            <div className="flex justify-around">
                {navItems.map((item) => (
                    <NavItem
                        key={item.name}
                        dropDownOptions={item.dropDownOptions}
                        name={item.name}
                        href={item.href}
                        active={location.pathname.includes(item.href)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Navigation;

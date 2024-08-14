import {Link, useLocation} from 'react-router-dom';
import  {useState, useEffect} from 'react';
import {motion, useAnimation} from 'framer-motion';
import NavItem from './NavItem';
import {BiHeart} from 'react-icons/bi';
import {twMerge} from 'tailwind-merge';
import {CiMenuFries} from "react-icons/ci";


const Navigation = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
    const controls = useAnimation();

    useEffect(() => {
        // Animate menu when `isOpen` changes
        controls.start({height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0});
    }, [isOpen, controls]);

    useEffect(() => {
        // Reset `isOpen` when screen size changes
        const handleResize = () => {
            console.log('res')
            if (window.innerWidth <= 768) {
                setIsOpen(false);
                setIsMobile(true);
            } else {
                setIsMobile(false);
                setIsOpen(true);
            }

        };

        window.addEventListener('resize', handleResize);
        handleResize();
        // Clean up the event listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        {name: <BiHeart/>, href: "/favorites"},
        {name: "Images", href: "/images"},
        {name: "Albums", href: "/albums", dropDownOptions: []},
        {name: "Contact", href: "/contact"},
    ];

    const closeMenu = () => {
        console.log(isMobile)
        if (isMobile) {
            setIsOpen(!isOpen);
        }
    }

    return (
        <nav
            className={twMerge("w-full p-4 flex flex-col md:flex-row items-center justify-between bg-black", location.pathname === '/' && !isMobile ? "bg-opacity-0" : 'bg-opacity-100')}>
            <div className="flex items-center justify-between w-full md:w-auto  pb-2">
                <Link to="/">
                    <div
                        className="hover:text-gray-300 transition-colors text-2xl md:text-3xl lg:text-5xl xl:text-7xl">KINAY
                        PHOTO
                    </div>
                </Link>
                <button
                    className="md:hidden text-5xl"
                    onClick={() => closeMenu()}
                >
                    <CiMenuFries className={twMerge('transition-transform',isOpen ? "-rotate-90": "rotate-0")}/>
                </button>
            </div>
            <motion.div
                className={twMerge("w-full md:w-auto my-7 md:my-0", isOpen ? "block" : "hidden md:block")}
                initial={{height: 0, opacity: 0}}
                animate={controls}
                transition={{duration: 0.3, ease: 'easeInOut'}}
            >
                <div className="flex flex-col md:flex-row md:gap-6 gap-10 items-center">
                    {navItems.map((item) => (
                        <NavItem
                            onclick={() => closeMenu()}
                            key={item.href}
                            href={item.href}
                            active={location.pathname.includes(item.href)}
                        >
                            {item.name}
                        </NavItem>
                    ))}
                </div>
            </motion.div>
        </nav>
    );
};

export default Navigation;

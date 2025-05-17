import {Link, useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {motion, useAnimation} from 'framer-motion';
import NavItem from './NavItem';
import {BiHeart, BiLogoInstagram} from 'react-icons/bi';
import {twMerge} from 'tailwind-merge';
import {CiMenuFries} from 'react-icons/ci';
import {GiWorld} from "react-icons/gi";
import {MdOutlineCompare} from "react-icons/md";
import {useUser} from "../../contexts/UserContext.tsx";
import NotificationToggle from "../Notifications/NotificationToggle.tsx";
import {isIOSDevice} from "../../utils/isiPhoneiPad.ts";

const Navigation = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
    const controls = useAnimation();
    const {userId, logout, openLoginModal} = useUser();

    useEffect(() => {
        controls.start({ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 });
    }, [isOpen, controls]);

    useEffect(() => {
        const handleResize = () => {
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
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: <BiLogoInstagram />, href: 'https://www.instagram.com/kinay.photo/' },
        { name: <BiHeart />, href: '/favorites' },
        { name: <GiWorld />, href: '/world' },
        {name: <MdOutlineCompare/>, href: '/vote'},
        { name: 'Images', href: '/images' },
        { name: 'Albums', href: '/albums', dropDownOptions: [] },
        { name: 'Contact', href: '/contact' },
    ];

    const handleLoginLogout = () => {
        if (userId) {
            logout();
        } else {
            openLoginModal()
        }
    };

    const closeMenu = () => {
        if (isMobile) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <nav
            className={twMerge(
                'w-full z-50 py-4 px-10 flex flex-col md:flex-row items-center justify-between',
                location.pathname === '/world' && 'fixed top-0 left-0 right-0 bg-black',
                isMobile && "bg-black"
            )}
        >
            <div className='flex items-center justify-between w-full md:w-auto pb-2'>
                <Link to='/'>
                    <div
                        onClick={() => {
                            if (isOpen) closeMenu()
                        }}
                        className='hover:text-gray-300 transition-colors text-2xl md:text-3xl lg:text-5xl xl:text-7xl'
                    >
                        KINAY PHOTO
                    </div>
                </Link>
                <button
                    className='md:hidden text-5xl'
                    onClick={() => closeMenu()}
                >
                    <CiMenuFries className={twMerge('transition-transform', isOpen ? '-rotate-90' : 'rotate-0')} />
                </button>
            </div>
            <motion.div
                className={twMerge('w-full md:w-auto my-7 md:my-0', isOpen ? 'block' : 'hidden md:block')}
                initial={{ height: 0, opacity: 0 }}
                animate={controls}
                transition={{duration: 0.1, ease: 'easeInOut'}}
            >
                <div className='flex flex-col md:flex-row md:gap-6 gap-10 items-center'>
                    {!isIOSDevice() &&  <NotificationToggle/>}
                    {[...navItems, {name: userId ? 'Logout' : 'Login', href: '#'}].map((item) => (
                        <NavItem
                            key={item.href + item.name}
                            href={item.href}
                            active={location.pathname.includes(item.href)}
                            onclick={(e) => {
                                // Always close the menu if mobile
                                closeMenu();

                                if (item.name === 'Login' || item.name === 'Logout') {
                                    e.preventDefault();
                                    handleLoginLogout();
                                } else if (item.href === '/favorites' && !userId) {
                                    e.preventDefault();
                                    openLoginModal(); // Trigger login modal if not logged in
                                }
                                // Else allow default behavior (i.e. go to the link)
                            }}
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

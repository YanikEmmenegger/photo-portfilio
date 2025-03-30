import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import NavItem from './NavItem';
import { BiHeart, BiLogoInstagram } from 'react-icons/bi';
import { twMerge } from 'tailwind-merge';
import { CiMenuFries } from 'react-icons/ci';
import {GiWorld} from "react-icons/gi";

const Navigation = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
    const controls = useAnimation();

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
        { name: 'Images', href: '/images' },
        { name: 'Albums', href: '/albums', dropDownOptions: [] },
        { name: 'About', href: '/about', dropDownOptions: [] },
        { name: 'Contact', href: '/contact' },
    ];

    const closeMenu = () => {
        if (isMobile) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <nav
            className={twMerge(
                'w-full z-50 py-4 px-10 flex flex-col md:flex-row items-center justify-between',
                location.pathname === '/world' && 'fixed top-0 left-0 right-0 bg-black' // Fixed nav only on /world page
            )}
        >
            <div className='flex items-center justify-between w-full md:w-auto pb-2'>
                <Link to='/'>
                    <div
                        onClick={() => closeMenu()}
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <div className='flex flex-col md:flex-row md:gap-6 gap-10 items-center'>
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

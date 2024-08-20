import { motion } from "framer-motion";
import Social from "../components/Social.tsx";
import {CiInstagram, CiLinkedin, CiMail} from "react-icons/ci";
import {SlSocialGithub} from "react-icons/sl";

const ContactPage = () => {
    return (
        <div
            className="w-full h-screen flex-col fixed top-0 left-0 -z-50 flex items-center justify-center bg-black text-white text-3xl">
            <motion.h1
                className={"py-10 text-5xl"}
                key="outline"
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.8}}
                transition={{duration: 0.25, ease: "easeInOut"}}>
                Contact
            </motion.h1>
                <div className="flex flex-col md:flex-row w-full mx-auto gap-10 justify-center items-center">
                        <Social Icon={CiInstagram} name={"Instagram"} url={"https://instagram.com/yanik.ee"}/>
                        <Social Icon={CiLinkedin} name={"Linkedin"} url={"https://www.linkedin.com/in/yanik-emmenegger/"}/>
                        <Social Icon={SlSocialGithub} name={"Github"} url={"https://github.com/YanikEmmenegger"}/>
                        <Social Icon={CiMail} name={"Email"} url={"mailto:emmenegger@yanik.pro"}/>
                </div>
        </div>
    );
};

export default ContactPage;

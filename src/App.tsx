import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import {BackgroundImageProvider} from './contexts/BackgroundImageContext.tsx';
import Navigation from "./components/Navigation/Navigation.tsx";
import MediaPage from "./pages/MediaPage.tsx";
import AlbumPage from "./pages/AlbumPage.tsx";
import AlbumDetailPage from "./pages/AlbumDetailPage.tsx";
import {UserProvider} from "./contexts/UserContext.tsx";
import FavoritePage from "./pages/FavoritePage.tsx";
import {Toaster} from "react-hot-toast";
import World from "./pages/World.tsx";
import BackToTop from "./components/BackToTop.tsx";
import AboutPage from "./pages/AboutPage.tsx";

const App = () => {
    return (
        <UserProvider>
            <BackgroundImageProvider>
                <div className={"flex flex-col min-h-screen"}>
                <Router basename={"/"}>
                    <Navigation/>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/contact" element={<ContactPage/>}/>
                        <Route path="/images" element={<MediaPage/>}/>
                        <Route path="/albums" element={<AlbumPage/>}/>
                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path={"/favorites"} element={<FavoritePage/>}/>
                        <Route path="/album/:albumId" element={<AlbumDetailPage/>}/>
                        <Route path={"world"} element={<World/>}/>
                    </Routes>
                </Router>
                </div>
            </BackgroundImageProvider>
            <Toaster/>
            <BackToTop/>
        </UserProvider>
    );
};

export default App;

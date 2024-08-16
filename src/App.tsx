import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import {BackgroundImageProvider} from './contexts/BackgroundImageContext.tsx';
import Navigation from "./components/Navigation/Navigation.tsx";
import ImagesPage from "./pages/ImagesPage.tsx";
import AlbumPage from "./pages/AlbumPage.tsx";
import AlbumDetailPage from "./pages/AlbumDetailPage.tsx";
import {UserProvider} from "./contexts/UserContext.tsx";
import FavoritePage from "./pages/FavoritePage.tsx";
import {Toaster} from "react-hot-toast";

const App = () => {
    return (
        <UserProvider>
            <BackgroundImageProvider>
                <Router basename={"/"}>
                    <Navigation/>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/contact" element={<ContactPage/>}/>
                        <Route path="/images" element={<ImagesPage/>}/>
                        <Route path="/albums" element={<AlbumPage/>}/>
                        <Route path={"/favorites"} element={<FavoritePage/>}/>
                        <Route path="/albums/:albumId" element={<AlbumDetailPage/>}/>
                    </Routes>
                </Router>
            </BackgroundImageProvider>
            <Toaster/>
        </UserProvider>
    );
};

export default App;

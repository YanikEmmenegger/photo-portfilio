import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import {ImageProvider} from './contexts/ImageContext';
import Navigation from "./components/Navigation/Navigation.tsx";
import ImagesPage from "./pages/ImagesPage.tsx";
import AlbumPage from "./pages/AlbumPage.tsx";
import AlbumDetailPage from "./pages/AlbumDetailPage.tsx";

const App = () => {
    return (
        <ImageProvider>
            <Router basename={"/photos/"}>
                <Navigation/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/contact" element={<ContactPage/>}/>
                    <Route path="/images" element={<ImagesPage/>}/>
                    <Route path="/albums" element={<AlbumPage/>}/>
                    <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
                </Routes>
            </Router>
        </ImageProvider>
    );
};

export default App;

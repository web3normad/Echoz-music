// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Import Pages
import MusicDashboard from './pages/MusicDashboard';
import Search from './pages/Search';
import Likes from './pages/Likes';
import Playlists from './pages/Playlist';
import Albums from './pages/Albums';
import Following from './pages/Following';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Logout from './pages/Logout';
// import NotFound from './pages/NotFound'; 

import ArtistDashboard from './pages/ArtistDashboard';
import UploadMusic from './pages/UploadMusic'
import Revenue from "./pages/Revenue"

import { ThemeProvider } from './context/ThemeContext';
import InvestorDashboard from './pages/InvestorDashboard';
import UserProfile from './pages/UserProfile';
import GlobalStreamRates from './pages/GlobalStreamRates';


function App() {
  return (
    <ThemeProvider> 
    <Router>
      <div className="flex dark:bg-[#131316] bg-[#fafafa]">
        <Sidebar />
        <div className="w-full dark:bg-[#131316] z-10">
          <Navbar />
          {/* Main content */}
          <main className="p-4 bg-gray-50 dark:bg-[#0F0F0F] overflow-y-hidden">
            <Routes>
              <Route path="/" element={<MusicDashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/likes" element={<Likes />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/following" element={<Following />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/logout" element={<Logout />} />
              {/* Fallback Route */}
              {/* <Route path="*" element={<NotFound />} /> */}

              <Route path="/artist-dashboard" element={<ArtistDashboard />} />
              <Route path="/upload-music" element={<UploadMusic />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/investor" element={<InvestorDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/global-stream" element={<GlobalStreamRates />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;

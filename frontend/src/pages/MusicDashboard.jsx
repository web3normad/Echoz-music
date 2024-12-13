import React, { useState } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart, 
  FaLock 
} from 'react-icons/fa';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const MusicStreamingPage = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeGenre, setActiveGenre] = useState('All Releases');
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('Basic');

  const genres = [
    'All Releases', 'Pop', 'Hip Hop', 'Rock', 'R&B', 'Electronic', 'Classical'
  ];

  const musicReleases = [
    {
      id: 1,
      title: 'Sunset Memories',
      artist: 'Luna Eclipse',
      album: 'Twilight Echoes',
      genre: 'Pop',
      streamCount: 1250000,
      revenue: 62500,
      duration: '3:45',
      image: '/sunset-memories.jpg',
      isExclusive: false
    },
    {
      id: 2,
      title: 'Quantum Groove',
      artist: 'Cyber Rhythm',
      album: 'Digital Waves',
      genre: 'Electronic',
      streamCount: 875000,
      revenue: 43750,
      duration: '4:12',
      image: '/quantum-groove.jpg',
      isExclusive: true
    },
    {
      id: 3,
      title: 'Urban Symphony',
      artist: 'Street Poets',
      album: 'City Lights',
      genre: 'Hip Hop',
      streamCount: 1500000,
      revenue: 75000,
      duration: '3:30',
      image: '/urban-symphony.jpg',
      isExclusive: false
    },
    {
      id: 4,
      title: 'Whispers of Time',
      artist: 'Acoustic Realm',
      album: 'Ethereal Moments',
      genre: 'Classical',
      streamCount: 450000,
      revenue: 22500,
      duration: '5:15',
      image: '/whispers-of-time.jpg',
      isExclusive: true
    }
  ];

  const filteredReleases = activeGenre === 'All Releases' 
    ? musicReleases 
    : musicReleases.filter(release => release.genre === activeGenre);

  const handlePlayPause = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const canPlayTrack = (track) => {
    if (!track.isExclusive) return true;
    
    const tierAccess = {
      'Free': false,
      'Basic': false,
      'Premium': true,
      'Ultimate': true
    };

    return tierAccess[userSubscriptionTier];
  };

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col">
      {/* Genre Filter Section */}
      <section className="px-6 mb-6">
        <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`
                    px-4 py-2 rounded-lg transition-all
                    ${activeGenre === genre 
                      ? 'bg-[#04e3cb] text-white' 
                      : 'bg-gray-200 dark:bg-[#0F0F0F] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1F1F1F]'}
                  `}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
                <ChevronLeft size={20} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Music Releases Section */}
      <section className="px-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6">
          {filteredReleases.map((release) => (
            <div 
              key={release.id}
              className="
                flex items-center justify-between 
                bg-white dark:bg-[#252727] 
                rounded-lg shadow-lg p-6
                hover:shadow-xl transition-all
              "
            >
              <div className="flex items-center space-x-6 w-1/3">
                <div 
                  className="w-16 h-16 bg-cover bg-center rounded-md"
                  style={{ backgroundImage: `url(${release.image})` }}
                />
                <div>
                  <h3 className="font-bold text-[#04e3cb]">{release.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white">{release.artist}</p>
                </div>
              </div>

              <div className="w-1/3 text-center">
                <p className="text-sm text-gray-500 dark:text-white">{release.album} | {release.genre}</p>
              </div>

              <div className="w-1/3 flex items-center justify-end space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">{release.streamCount.toLocaleString()} Streams</p>
                  <p className="text-sm text-[#04e3cb]">${release.revenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {canPlayTrack(release) ? (
                    <button 
                      onClick={() => handlePlayPause(release)}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${currentTrack?.id === release.id && isPlaying
                          ? 'bg-[#04e3cb] text-white'
                          : 'bg-gray-200 dark:bg-[#0F0F0F] text-gray-600 dark:text-white'}
                      `}
                    >
                      {currentTrack?.id === release.id && isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                  ) : (
                    <button 
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] text-gray-400"
                      title="Upgrade subscription to play"
                    >
                      <FaLock />
                    </button>
                  )}
                  <button className="text-[#04e3cb] hover:text-red-500">
                    <FaRegHeart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Now Playing Section */}
      {currentTrack && (
        <section className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#252727] shadow-2xl p-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 bg-cover bg-center rounded-md"
                style={{ backgroundImage: `url(${currentTrack.image})` }}
              />
              <div>
                <h4 className="font-bold text-[#04e3cb]">{currentTrack.title}</h4>
                <p className="text-sm text-gray-500 dark:text-white">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <FaPause className="text-[#04e3cb]" /> : <FaPlay className="text-[#04e3cb]" />}
              </button>
              <p className="text-sm text-gray-500">{currentTrack.duration}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MusicStreamingPage;
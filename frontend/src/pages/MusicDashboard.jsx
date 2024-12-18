import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { Play, Pause, SkipForward, SkipBack, Repeat, Heart, Volume2, Volume1, VolumeX, Shuffle } from "lucide-react";
import MusicContractABI from "../../ABI/MusicPlatform.json";

// Smart Contract Configuration
const MUSIC_CONTRACT_ADDRESS = "0xb54e82109bCDA78A5D84d5E5a295950211Aba6aC";

const MusicStreamPage = () => {
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Fetch tracks from smart contract
  const fetchMusicTracks = async () => {
    try {
      // Connect to Ethereum Provider
      if (!window.ethereum) {
        throw new Error("Ethereum wallet not detected");
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Initialize contract
      const contract = new ethers.Contract(
        MUSIC_CONTRACT_ADDRESS,
        MusicContractABI,
        signer
      );

      // Fetch song IDs
      const trackIds = await contract.getAllSongIds();

      // Fetch details for each track
      const tracks = await Promise.all(
        trackIds.map(async (songId) => {
          try {
            // Fetch song details using the getSongDetails method from the contract
            const [
              artist,
              name,
              genre,
              ipfsAudioHash,
              ipfsArtworkHash
            ] = await contract.getSongDetails(songId);

            // Construct track object
            return {
              id: songId.toString(),
              title: name,
              artist: artist,
              genre: genre,
              coverUrl: `https://gateway.pinata.cloud/ipfs/${ipfsArtworkHash}`,
              songUrl: `https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`
            };
          } catch (trackError) {
            console.error(`Error fetching details for track ${songId}:`, trackError);
            return null;
          }
        })
      );

      // Filter out any null tracks
      const validTracks = tracks.filter(track => track !== null);

      setUploadedTracks(validTracks);
      if (validTracks.length > 0) {
        setCurrentTrack(validTracks[0]);
      }
    } catch (err) {
      console.error("Detailed error:", err);
      setError(`Failed to fetch music tracks: ${err.message}`);
    }
  };

  // Fetch tracks on component mount
  useEffect(() => {
    fetchMusicTracks();
  }, []);

  // Update progress bar
  useEffect(() => {
    const audioElement = audioRef.current;
    const updateProgress = () => {
      const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
      setProgress(progressPercent);
    };

    audioElement?.addEventListener('timeupdate', updateProgress);
    return () => audioElement?.removeEventListener('timeupdate', updateProgress);
  }, [currentTrack]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play current track
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.songUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (index) => {
    setTrackIndex(index);
    setCurrentTrack(uploadedTracks[index]);
  };

  const handleNext = () => {
    const nextIndex = (trackIndex + 1) % uploadedTracks.length;
    setTrackIndex(nextIndex);
    setCurrentTrack(uploadedTracks[nextIndex]);
  };

  const handlePrevious = () => {
    const prevIndex = trackIndex === 0 ? uploadedTracks.length - 1 : trackIndex - 1;
    setTrackIndex(prevIndex);
    setCurrentTrack(uploadedTracks[prevIndex]);
  };

  const handleRepeatToggle = () => {
    setIsRepeat(!isRepeat);
    audioRef.current.loop = !isRepeat;
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleFavorite = (trackId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(trackId)) {
        return prevFavorites.filter(id => id !== trackId);
      } else {
        return [...prevFavorites, trackId];
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error) {
    return (
      <div className="bg-[#121212] min-h-screen p-32 text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen p-32 text-white flex">
      <div className="flex-1 bg-[#121212] p-6 overflow-y-auto">
        {/* Listen Now Heading */}
        <h1 className="text-3xl font-bold mb-8">Listen Now</h1>

        {/* Main Content */}
        <div className="flex-1 bg-[#121212] p-6 overflow-y-auto">
          {/* Track Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {uploadedTracks.length > 0 ? (
              uploadedTracks.map((track, index) => (
                <div 
                  key={track.id} 
                  className="bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors group"
                  onClick={() => handleTrackSelect(index)}
                >
                  <div className="relative">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full aspect-square object-cover rounded-md shadow-lg mb-4"
                      onError={(e) => e.target.src = "default_cover.jpg"}
                    />
                    <button 
                      className="absolute bottom-2 right-2 bg-teal-500 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackSelect(index);
                      }}
                    >
                      <Play fill="black" size={24} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-base truncate mt-2">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No tracks available
              </div>
            )}
          </div>

          {/* Player Controls */}
          {currentTrack && (
            <div className="fixed bottom-0 w-[86%] left-42 right-0 bg-[#181818] p-2">
              <div className="max-w-6xl mx-auto">
                {/* Current Track Info */}
                <div className="flex items-center mb-2">
                  <img 
                    src={currentTrack.coverUrl} 
                    alt={currentTrack.title} 
                    className="w-16 h-16 mr-4 rounded"
                    onError={(e) => e.target.src = "default_cover.jpg"}
                  />
                  <div>
                    <h4 className="font-semibold">{currentTrack.title}</h4>
                    <p className="text-sm text-gray-400">{currentTrack.artist}</p>
                  </div>
                  <button 
                    onClick={() => handleFavorite(currentTrack.id)}
                    className="ml-4"
                  >
                    <Heart 
                      className={`${favorites.includes(currentTrack.id) ? "text-green-500" : "text-white"}`} 
                    />
                  </button>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-4 mb-2">
                    <button onClick={handleShuffleToggle}>
                      <Shuffle 
                        className={`${isShuffle ? "text-green-500" : "text-white"}`} 
                      />
                    </button>
                    <button onClick={handlePrevious}>
                      <SkipBack />
                    </button>
                    <button 
                      onClick={handlePlayPause} 
                      className="bg-white text-black rounded-full p-2"
                    >
                      {isPlaying ? <Pause fill="black" /> : <Play fill="black" />}
                    </button>
                    <button onClick={handleNext}>
                      <SkipForward />
                    </button>
                    <button onClick={handleRepeatToggle}>
                      <Repeat 
                        className={`${isRepeat ? "text-green-500" : "text-white"}`} 
                      />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-xs">
                      {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <div className="flex-1 bg-[#404040] h-1 rounded-full">
                      <div 
                        className="bg-white h-1 rounded-full" 
                        style={{width: `${progress}%`}} 
                      />
                    </div>
                    <span className="text-xs">
                      {formatTime(audioRef.current?.duration || 0)}
                    </span>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2 mt-2">
                    {volume === 0 ? <VolumeX /> : volume < 0.5 ? <Volume1 /> : <Volume2 />}
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-32 h-1 bg-gray-600 rounded-full appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Audio Element */}
          <audio 
            ref={audioRef} 
            src={currentTrack?.songUrl} 
            onEnded={handleNext} 
            style={{ display: "none" }} 
          />
        </div>
      </div>
    </div>
  );
};

export default MusicStreamPage;
import React, { useState, useEffect } from 'react';
import { Rocket, Award } from 'lucide-react';
import { createThirdwebClient, getContract } from "thirdweb";


import MusicNFTContractABI from "../../ABI/MusicNFT.json";

const MUSIC_NFT_CONTRACT_ADDRESS = "0x4Bd7993903cb7c69A6037cb4587DDAa709C1d716";

const ExplorePage = () => {
  const [exploreMode, setExploreMode] = useState('trending');
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID 
  });

  const contract = getContract({
    client, 
    address: MUSIC_NFT_CONTRACT_ADDRESS,
    abi: MusicNFTContractABI
  });

  const resolveIpfsUri = (cid) => {
    if (!cid) return null;
    return cid.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${cid.split("ipfs://")[1]}`
      : `https://ipfs.io/ipfs/${cid}`;
  };

  const formatTrack = (track) => ({
    id: track.id.toString(),
    title: track.title || "Unknown Title",
    artist: track.artist || "Unknown Artist",
    totalShares: track.totalShares ? Number(track.totalShares) : 0,
    availableShares: track.availableShares ? Number(track.availableShares) : 0,
    pricePerShare: track.sharePrice ? Number(track.sharePrice) / 10 ** 18 : 0,
    genre: track.genre || "Uncategorized",
    potentialRevenue: 0.05,
    coverImage: resolveIpfsUri(track.coverImageCID),
    songUrl: resolveIpfsUri(track.songCID),
  });

  const fetchMusicTracks = async () => {
    setIsLoading(true);
    try {
      const tracks = await contract.call("getAllMusicRights");
      console.log("Fetched tracks:", tracks); // Debugging step
      if (!tracks || !Array.isArray(tracks)) {
        throw new Error("Invalid response from contract");
      }
      setFeaturedTracks(tracks.map(formatTrack));
    } catch (err) {
      console.error("Error fetching tracks:", err); // Log detailed error
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  if (isLoading) return <div>Loading featured tracks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-6 text-[#04e3cb]">Music Investment Hub</h1>
      
      <div className="flex space-x-4 mb-6">
        {[
          { name: 'trending', icon: Rocket },
          { name: 'new', icon: Award }
        ].map((mode) => (
          <button
            key={mode.name}
            onClick={() => setExploreMode(mode.name)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg
              ${exploreMode === mode.name
                ? 'bg-[#04e3cb] text-black'
                : 'bg-[#252727] text-white hover:bg-[#353535]'}
            `}
          >
            <mode.icon className="w-4 h-4" />
            <span className="capitalize">{mode.name}</span>
          </button>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Featured Investment Tracks</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredTracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};

const TrackCard = ({ track }) => (
  <div className="bg-[#252727] rounded-lg p-4 flex flex-col justify-between w-full aspect-square relative overflow-hidden">
    <div className="absolute top-2 right-2 bg-[#04e3cb] text-black px-2 py-1 rounded-full text-xs">
      {track.genre || "Uncategorized"}
    </div>
    {track.coverImage ? (
      <img
        src={track.coverImage}
        alt={`${track.title} album cover`}
        className="w-full h-1/2 object-cover rounded-md mb-3"
      />
    ) : (
      <div className="w-full h-1/2 bg-gray-700 flex items-center justify-center text-gray-400">
        No Image Available
      </div>
    )}
    <div className="flex-grow flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{track.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{track.artist}</p>
      </div>
      <div>
        <div className="text-sm mb-2">
          <p className="text-white">Available: {track.availableShares} shares</p>
          <p className="text-[#04e3cb]">Potential Revenue: {track.potentialRevenue * 100}%</p>
        </div>
        {track.songUrl ? (
          <a
            href={track.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#04e3cb] text-black py-3 rounded-xl hover:bg-[#03DAC5] transition-colors"
          >
            Listen Now
          </a>
        ) : (
          <div className="w-full bg-gray-700 text-white py-3 rounded-xl text-center">
            Song Unavailable
          </div>
        )}
      </div>
    </div>
  </div>
);
export default ExplorePage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Rocket, Award } from "lucide-react";
import MusicContractABI from "../../ABI/MusicPlatform.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Smart Contract Configuration
const MUSIC_CONTRACT_ADDRESS = "0xb54e82109bCDA78A5D84d5E5a295950211Aba6aC";

const ExplorePage = () => {
  const [exploreMode, setExploreMode] = useState("trending");
  const [musicTracks, setMusicTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalTrack, setModalTrack] = useState(null);
  const [sharesToBuy, setSharesToBuy] = useState("");

  const fetchMusicTracks = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error("Ethereum wallet not detected");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        MUSIC_CONTRACT_ADDRESS,
        MusicContractABI,
        signer
      );

      let trackIds = await contract.getAllSongIds();

      const tracks = await Promise.all(
        trackIds.map(async (songId) => {
          const [
            artist,
            name,
            genre,
            ipfsAudioHash,
            ipfsArtworkHash,
            totalShares,
            sharePrice,
            releasedDate,
          ] = await contract.getSongDetails(songId);

          return {
            id: songId.toString(),
            title: name,
            artist,
            genre,
            coverImage: `https://gateway.pinata.cloud/ipfs/${ipfsArtworkHash}`,
            songUrl: `https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`,
            availableShares: totalShares.toString(),
            pricePerShare: ethers.utils.formatEther(sharePrice),
            releasedDate: new Date(releasedDate.mul(1000).toNumber()).toLocaleDateString(),
          };
        })
      );

      setMusicTracks(tracks.filter((track) => track !== null));
    } catch (err) {
      setError(`Failed to fetch music tracks: ${err.message}`);
      toast.error(`Error fetching tracks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  const handleBuyShares = async (track) => {
    try {
      if (!track) {
        toast.error("Track data is missing!");
        return;
      }
  
      if (!window.ethereum) {
        toast.error("Ethereum wallet not detected");
        return;
      }
  
      if (!sharesToBuy || isNaN(sharesToBuy) || sharesToBuy <= 0) {
        toast.error("Please enter a valid number of shares.");
        return;
      }
  
      const parsedShares = parseInt(sharesToBuy);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        MUSIC_CONTRACT_ADDRESS,
        MusicContractABI,
        signer
      );
  
      const sharePriceInWei = ethers.utils.parseUnits(track.pricePerShare, "ether");
      const totalCost = sharePriceInWei.mul(parsedShares);
  
      const walletBalance = await signer.getBalance();
      if (walletBalance.lt(totalCost)) {
        toast.error("Insufficient funds for this transaction.");
        return;
      }
  
      const tx = await contract.buyShares(track.id, parsedShares, {
        value: totalCost,
      });
  
      await tx.wait();
      toast.success(`Successfully bought ${parsedShares} shares of ${track.title}!`);
      fetchMusicTracks(); // Refresh track data
  
      // Close the modal after successful transaction
      setModalTrack(null);
    } catch (error) {
      console.error("Error buying shares:", error);
  
      if (error.code === -32603) {
        toast.error("Transaction failed. Ensure you have enough ETH and the input is valid.");
      } else {
        toast.error(`Failed to buy shares: ${error.reason || error.message}`);
      }
    }
  };
  

  return (
    <div className="container mx-auto p-6 bg-black text-white">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 text-[#04e3cb]">Music Investment Hub</h1>

      <div className="flex space-x-4 mb-6">
        {[
          { name: "trending", icon: Rocket },
          { name: "new", icon: Award },
        ].map((mode) => (
          <button
            key={mode.name}
            onClick={() => setExploreMode(mode.name)}
            className={
              `flex items-center space-x-2 px-4 py-2 rounded-lg ` +
              (exploreMode === mode.name
                ? "bg-[#04e3cb] text-black"
                : "bg-[#252727] text-white hover:bg-[#353535]")
            }
          >
            <mode.icon className="w-4 h-4" />
            <span className="capitalize">{mode.name}</span>
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Featured Investment Tracks</h2>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading tracks...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : musicTracks.length === 0 ? (
        <div className="text-center text-gray-500">No tracks available at the moment</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {musicTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onBuy={() => {
                setModalTrack(track);
                setSharesToBuy("");
              }}
            />
          ))}
        </div>
      )}

      {modalTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#252727] text-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Buy Shares: {modalTrack.title}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter number of shares:</label>
              <input
                type="number"
                className="w-full border px-3 py-2 bg-[#252727] rounded-md"
                value={sharesToBuy}
                onChange={(e) => setSharesToBuy(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleBuyShares(modalTrack)}
                className="flex-grow bg-[#04e3cb] text-black py-2 rounded-md"
              >
                Buy Now
              </button>
              <button
                onClick={() => setModalTrack(null)}
                className="flex-grow bg-gray-300 text-black py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackCard = ({ track, onBuy }) => {
  const navigate = useNavigate();

  const handleListen = () => {
    localStorage.setItem("currentTrack", JSON.stringify(track));
    navigate("/stream-music");
  };

  return (
    <div className="bg-[#252727] rounded-lg p-4 flex flex-col justify-between w-full h-[500px] aspect-square relative overflow-hidden">
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
          <p className="text-gray-400 text-sm">By {track.artist}</p>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-400">Shares Available: {track.availableShares}</p>
          <p className="text-sm text-gray-400">Price per Share: {track.pricePerShare} ETH</p>
        </div>
        <div className="mt-4">
          <button
            onClick={handleListen}
            className="bg-[#04e3cb] text-black px-4 py-2 rounded-md text-sm w-full mb-2"
          >
            Listen Now
          </button>
          <button
            onClick={onBuy}
            className="bg-[#1E1E1E] text-[#04e3cb] border border-[#04e3cb] px-4 py-2 rounded-md text-sm w-full"
          >
            Buy Shares
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;

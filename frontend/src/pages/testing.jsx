import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from 'ethers'; 

// ABI imports
import MusicNFTContractABI from "../../ABI/MusicNFT.json";
import MusicStreamingABI from "../../ABI/MusicPlatform.json"

// Contract Addresses
const MUSIC_NFT_CONTRACT_ADDRESS = "0x4Bd7993903cb7c69A6037cb4587DDAa709C1d716";
const MUSIC_STREAMING_CONTRACT_ADDRESS  = "0x1548bBc64288241142B902c4D0B2D94912435D05"

const UploadMusic = () => {
  const [newRelease, setNewRelease] = useState({
    title: "",
    artist: "",
    year: "",
    genre: "",
    songFile: null,
    albumCover: null,
    hasInvestors: false,
    investorPercentage: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUrls, setIpfsUrls] = useState({
    songUrl: "",
    coverUrl: "",
  });

  const songFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  const uploadMusic = async (musicData) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
    
      const musicNFTContract = new ethers.Contract(
        MUSIC_NFT_CONTRACT_ADDRESS, 
        MusicNFTContractABI, 
        signer
      );
      const tx = await musicNFTContract.createMusicRights(
        
        musicData.title,
        
      
        musicData.songIPFSHash, 
        
        
        ethers.utils.parseUnits(newRelease.hasInvestors ? "100" : "0", "ether"),
        
      
        ethers.utils.parseUnits("0.01", "ether"), 
        
       
        newRelease.hasInvestors,
        
       
        ethers.utils.parseUnits("1", "ether") 
      );

      return tx;
    } catch (error) {
      console.error("Error uploading to contract:", error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInvestorToggle = (e) => {
    const { checked } = e.target;
    setNewRelease((prev) => ({
      ...prev,
      hasInvestors: checked,
      investorPercentage: checked ? prev.investorPercentage : "",
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      console.log(`File selected for ${name}:`, files[0]);
      setNewRelease((prev) => ({
        ...prev,
        [name]: files[0], 
      }));
    } else {
      console.log(`No file selected for ${name}`);
    }
  };
  const uploadToPinata = async ({ file, type }) => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file passed to uploadToPinata");
      }
  
    
      const formData = new FormData();
      formData.append("file", file);
  
      
      const pinataMetadata = JSON.stringify({
        name: type === "song" ? "Uploaded Song" : "Album Cover",
        keyvalues: {
          type: type,
        },
      });
      formData.append("pinataMetadata", pinataMetadata);
  
     
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", pinataOptions);
  
     
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`, 
        },
        body: formData,
      });
  
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Pinata API Error:", error);
        throw new Error(`Failed to upload ${type} to Pinata`);
      }
  
   
      const result = await response.json();
      console.log(`${type} upload result:`, result);
  
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };
  
  const pinByHash = async (ipfsHash, type) => {
    try {
      console.log(`Attempting to pin ${type} with hash: ${ipfsHash}`);
      const response = await fetch("https://api.pinata.cloud/pinning/pinByHash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`, // Use your environment variable
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
          metadata: {
            name: `${type} File`,
          },
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from Pinata API:", error);
        throw new Error(`Failed to pin ${type} by hash: ${error.error || error.message || "Unknown error"}`);
      }
  
      const result = await response.json();
      console.log(`Pinned ${type} successfully:`, result);
    } catch (error) {
      console.error(`Error in pinByHash for ${type}:`, error);
      throw new Error(`Failed to pin ${type} by hash`);
    }
  };
  
  const pinataUploadMutation = useMutation({
    mutationFn: uploadToPinata,
    onError: (error) => {
      toast.error(error.message);
      setIsUploading(false);
    },
    onSuccess: (data, variables) => {
      if (variables.type === "song") {
        setIpfsUrls((prev) => ({ ...prev, songUrl: data }));
      } else if (variables.type === "cover") {
        setIpfsUrls((prev) => ({ ...prev, coverUrl: data }));
      }
    },
  });

const handleFormSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  if (
    !newRelease.title ||
    !newRelease.songFile ||
    !newRelease.albumCover
  ) {
    toast.error("Please fill out all fields.");
    setIsUploading(false);
    return;
  }

  try {
    if (!window.ethereum) {
      throw new Error("Ethereum wallet not detected. Please install MetaMask.");
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const musicNFTContract = new ethers.Contract(
      MUSIC_NFT_CONTRACT_ADDRESS, 
      MusicNFTContractABI, 
      signer
    );

    const songFileURL = await pinataUploadMutation.mutateAsync({
      file: newRelease.songFile,
      type: "song",
    });

    const albumCoverURL = await pinataUploadMutation.mutateAsync({
      file: newRelease.albumCover,
      type: "cover",
    });

    console.log("Song File URL:", songFileURL);
    console.log("Album Cover URL:", albumCoverURL);


    const title = newRelease.title || "";
    const sharePercentage = newRelease.hasInvestors 
      ? ethers.utils.parseUnits("100", "ether") 
      : ethers.utils.parseUnits("0", "ether");
    const sharePrice = ethers.utils.parseUnits("0.01", "ether");
    const fullRightsSaleAllowed = newRelease.hasInvestors;
    const fullRightsPrice = ethers.utils.parseUnits("1", "ether");

    // Create music rights NFT transaction
    const createMusicTx = await musicNFTContract.createMusicRights(
      title,
      songFileURL,
      sharePercentage,
      sharePrice,
      fullRightsSaleAllowed,
      fullRightsPrice
    );

    const createMusicReceipt = await createMusicTx.wait();

    const genreToUse = newRelease.genre && newRelease.genre.trim() !== "" 
                        ? newRelease.genre.trim() 
                        : "Unknown";
    toast.success(`Music uploaded successfully!`);

    // Reset form
    setNewRelease({
      title: "",
      artist: "",
      year: "",
      genre: "",
      songFile: null,
      albumCover: null,
      hasInvestors: false,
      investorPercentage: "",
    });

    // Clear file inputs
    if (songFileInputRef.current) {
      songFileInputRef.current.value = null;
    }
    if (albumCoverInputRef.current) {
      albumCoverInputRef.current.value = null;
    }

  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    if (error.error) {
      console.error("Nested error:", error.error);
    }

    if (error.code === 4001) {
      toast.error("Transaction rejected by user");
    } else if (error.message.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction");
    } else if (error.message.includes("Ethereum wallet not detected")) {
      toast.error("Please install MetaMask or another Ethereum wallet");
    } else {
      toast.error(`Upload failed: ${error.message}`);
    }
  } finally {
    setIsUploading(false);
  }
};

  

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ToastContainer />
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
          Upload Your Music
        </h3>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Form Inputs for Song Title, Artist Name, Year, Genre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song Title
              </label>
              <input
                type="text"
                name="title"
                value={newRelease.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
                placeholder="Enter song title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                name="artist"
                value={newRelease.artist}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
                placeholder="Enter artist name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Year
              </label>
              <input
                type="number"
                name="year"
                value={newRelease.year}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
                placeholder="Enter release year"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={newRelease.genre}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
                required
              >
                <option value="">Select genre</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Electronic">Electronic</option>
              </select>
            </div>
          </div>
          {/* File upload for song and album cover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song File
              </label>
              <div
                className="border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer"
                onClick={() => songFileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={songFileInputRef}
                  name="songFile"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".mp3,.wav"
                  required
                />
                <UploadCloud className="w-12 h-12 mx-auto text-[#04e3cb]" />
                <p className="mt-4 text-center text-white text-lg">
                  {newRelease.songFile 
                    ? newRelease.songFile.name 
                    : "Click to upload song file"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Album Cover
              </label>
              <div
                className="border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer"
                onClick={() => albumCoverInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={albumCoverInputRef}
                  name="albumCover"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  required
                />
                <ImageIcon className="w-12 h-12 mx-auto text-[#04e3cb]" />
                <p className="mt-4 text-center text-white text-lg">
                  {newRelease.albumCover 
                    ? newRelease.albumCover.name 
                    : "Click to upload album cover"}
                </p>
              </div>
            </div>
          </div>
          {/* Investor information (optional) */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="hasInvestors"
              checked={newRelease.hasInvestors}
              onChange={handleInvestorToggle}
              className="h-5 w-5 text-[#04e3cb] border-gray-300 rounded"
            />
            <label className="text-sm text-gray-300">
              This music has investors
            </label>
          </div>
          {newRelease.hasInvestors && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Investor Share Percentage
              </label>
              <input
                type="number"
                name="investorPercentage"
                value={newRelease.investorPercentage}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
                placeholder="Enter investor percentage"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className={`w-full py-3 px-5 mt-4 bg-[#04e3cb] text-gray-700 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-[#38837b] ${
              isUploading && "cursor-not-allowed opacity-50"
            }`}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Music"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;
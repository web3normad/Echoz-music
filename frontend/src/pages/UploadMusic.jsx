import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from 'ethers';

// Replace with your actual contract ABI and address
import MusicContractABI from "../../ABI/MusicPlatform.json";
const MUSIC_CONTRACT_ADDRESS = "0xb54e82109bCDA78A5D84d5E5a295950211Aba6aC";

const UploadMusic = () => {
  const [newRelease, setNewRelease] = useState({
    name: "",
    genre: "",
    musicFile: null,
    albumCover: null,
    totalShares: "",
    sharePrice: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const musicFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  // Utility function to upload file to Pinata
  const uploadToPinata = async ({ file, type }) => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file passed to uploadToPinata");
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      const pinataMetadata = JSON.stringify({
        name: type === "music" ? "Uploaded Music" : "Album Cover",
        keyvalues: { type: type },
      });
      formData.append("pinataMetadata", pinataMetadata);
  
      const pinataOptions = JSON.stringify({ cidVersion: 1 });
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
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setNewRelease((prev) => ({
        ...prev,
        [name]: files[0], 
      }));
    }
  };

  // Main form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
  
    // Validate form fields
    if (!newRelease.name || !newRelease.name.trim()) {
      toast.error("Song name is required and cannot be empty.");
      setIsUploading(false);
      return;
    }
  
    if (!newRelease.musicFile) {
      toast.error("Music file is required.");
      setIsUploading(false);
      return;
    }
  
    if (!newRelease.albumCover) {
      toast.error("Album cover is required.");
      setIsUploading(false);
      return;
    }
  
    try {
      // Ensure Ethereum wallet is connected
      if (!window.ethereum) {
        throw new Error("Ethereum wallet not detected. Please install MetaMask.");
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
  
      // Upload music file to IPFS
      const musicFileIPFSHash = await uploadToPinata({
        file: newRelease.musicFile,
        type: "music",
      });
  
      // Upload album cover to IPFS
      const albumCoverIPFSHash = await uploadToPinata({
        file: newRelease.albumCover,
        type: "cover",
      });
  
      // Create contract instance
      const musicContract = new ethers.Contract(
        MUSIC_CONTRACT_ADDRESS, 
        MusicContractABI, 
        signer
      );
  
      // Prepare contract parameters
      const name = newRelease.name.trim();
      const genre = (newRelease.genre || "Unknown").trim();
      
      // Convert total shares and share price
      // Default to 100 shares if not specified
      const totalShares = newRelease.totalShares 
        ? ethers.utils.parseUnits(newRelease.totalShares, 0) 
        : ethers.utils.parseUnits("100", 0);
      
      // Default to 0.01 ETH per share if not specified
      const sharePrice = newRelease.sharePrice 
        ? ethers.utils.parseEther(newRelease.sharePrice) 
        : ethers.utils.parseEther("0.01");
  
      console.log("Upload Parameters:", {
        name,
        genre,
        musicFileIPFSHash,
        albumCoverIPFSHash,
        totalShares: totalShares.toString(),
        sharePrice: sharePrice.toString(),
      });
  
      try {
        // Estimate gas manually
        let gasEstimate;
        try {
          gasEstimate = await musicContract.estimateGas.uploadSong(
            name,
            genre,
            musicFileIPFSHash,
            albumCoverIPFSHash,
            totalShares,
            sharePrice
          );
          console.log("Gas Estimate:", gasEstimate.toString());
        } catch (estimateError) {
          console.error("Gas Estimation Error:", estimateError);
          toast.error("Failed to estimate gas. Please check your inputs.");
          setIsUploading(false);
          return;
        }
  
        // Call smart contract method to upload song with gas limit
        const uploadTx = await musicContract.uploadSong(
          name,
          genre,
          musicFileIPFSHash,
          albumCoverIPFSHash,
          totalShares,
          sharePrice,
          {
            gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
          }
        );
  
        console.log("Transaction sent. Hash:", uploadTx.hash);
  
        // Wait for transaction to be mined
        const receipt = await uploadTx.wait();
  
        console.log("Transaction Receipt:", receipt);
  
        // Show success toast
        toast.success("Song uploaded successfully!");
  
        // Reset form
        setNewRelease({
          name: "",
          genre: "",
          musicFile: null,
          albumCover: null,
          totalShares: "",
          sharePrice: "",
        });
  
        // Clear file inputs
        if (musicFileInputRef.current) {
          musicFileInputRef.current.value = null;
        }
        if (albumCoverInputRef.current) {
          albumCoverInputRef.current.value = null;
        }
  
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        
        // More detailed error logging
        const errorMessage = contractError.reason || contractError.message;
        
        if (errorMessage.includes("execution reverted")) {
          toast.error("Transaction was reverted. Check contract requirements.");
        } else if (errorMessage.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction");
        } else {
          toast.error(`Upload failed: ${errorMessage}`);
        }
        
        // Log the full error for debugging
        console.error("Full error object:", contractError);
      }
  
    } catch (error) {
      console.error("Upload error:", error);
  
      // Handle wallet or general errors
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
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
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
          Upload Your Music
        </h3>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Song Name Input (changed from title) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Song Name
            </label>
            <input
              type="text"
              name="name"
              value={newRelease.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
              placeholder="Enter song name"
              required
            />
          </div>

          {/* Rest of the form remains the same as your original component */}
          {/* Genre Input */}
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

          {/* Music File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Music File
            </label>
            <div
              className="border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer"
              onClick={() => musicFileInputRef.current.click()}
            >
              <input
                type="file"
                ref={musicFileInputRef}
                name="musicFile"
                onChange={handleFileChange}
                className="hidden"
                accept=".mp3,.wav"
                required
              />
              <UploadCloud className="w-12 h-12 mx-auto text-[#04e3cb]" />
              <p className="mt-4 text-center text-white text-lg">
                {newRelease.musicFile 
                  ? newRelease.musicFile.name 
                  : "Click to upload music file"}
              </p>
            </div>
          </div>

          {/* Album Cover Upload */}
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

          {/* Total Shares Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Shares
            </label>
            <input
              type="number"
              name="totalShares"
              value={newRelease.totalShares}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
              placeholder="Enter total shares (default: 100)"
            />
          </div>

          {/* Share Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Price (in ETH)
            </label>
            <input
              type="number"
              name="sharePrice"
              value={newRelease.sharePrice}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
              placeholder="Enter share price (default: 0.01 ETH)"
            />
          </div>

          {/* Submit Button */}
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
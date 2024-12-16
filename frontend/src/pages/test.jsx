import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useSendTransaction, useActiveWallet, useActiveAccount } from "thirdweb/react";
import { prepareContractCall, toWei, sendTransaction } from "thirdweb";
import { waitForReceipt } from "thirdweb/transaction";

// ABI imports
import MusicNFTContractABI from "../../ABI/MusicNFT.json";
import ThamaniStreamingPlatformABI from "../../ABI/MusicPlatform.json";

// Contract Addresses
const MUSIC_NFT_CONTRACT_ADDRESS = "0x4Bd7993903cb7c69A6037cb4587DDAa709C1d716";
const THAMANI_STREAMING_PLATFORM_ADDRESS = "0xbb9Ae81c1A4d3Dac663593B798Fd3e2aF38AEb87";

const UploadMusic = () => {
  const [newRelease, setNewRelease] = useState({
    title: "",
    artist: "",
    year: "",
    songFile: null,
    albumCover: null,
    hasInvestors: false,
    investorPercentage: "",
  });

  const [ipfsUrls, setIpfsUrls] = useState({ songUrl: "", coverUrl: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const songFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  // Get active wallet and account
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();

  // Transaction hook
  const { mutate: sendTx } = useSendTransaction();

  // Pinata upload function
  const uploadToPinata = async (file) => {
    try {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
      formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

      const JWT = import.meta.env.VITE_PINATA_JWT;
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload file to Pinata: ${errorData.message}`);
      }

      const result = await response.json();
      return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    } catch (error) {
      throw error;
    }
  };

  // Comprehensive form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate wallet connection
    if (!activeWallet || !activeAccount) {
      setError("Please connect your wallet first.");
      setIsLoading(false);
      return;
    }

    // Validation checks
    const requiredFields = ["title", "artist", "year", "songFile", "albumCover"];
    const missingFields = requiredFields.filter(
      (field) => !newRelease[field] || (typeof newRelease[field] === "string" && newRelease[field].trim() === "")
    );

    if (missingFields.length > 0) {
      setError(`Please fill out all fields: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    try {
      // Upload files to Pinata
      const songUrl = await uploadToPinata(newRelease.songFile);
      const coverUrl = await uploadToPinata(newRelease.albumCover);

      setIpfsUrls({ songUrl, coverUrl });

      // Prepare contract call to create music rights
      const createMusicRightsCall = prepareContractCall({
        contract: {
          address: MUSIC_NFT_CONTRACT_ADDRESS,
          abi: MusicNFTContractABI,
        },
        method: "createMusicRights",
        params: [
          newRelease.title,
          songUrl,
          newRelease.hasInvestors
            ? Math.round(parseFloat(newRelease.investorPercentage) * 100)
            : 0,
          toWei("0.01"),
          true,
          toWei("1"),
        ],
      });

      if (!createMusicRightsCall) {
        throw new Error("Failed to prepare the contract call.");
      }

      // Send transaction with comprehensive error handling
      const transaction = await sendTransaction({
        transaction: createMusicRightsCall,
        account: activeAccount,
      });

      if (!transaction) {
        throw new Error("Transaction failed to send.");
      }

      // Wait for transaction receipt
      const receipt = await waitForReceipt({
        transaction,
        onReceipt: (receipt) => {
          console.log("Transaction Receipt:", receipt);
        },
      });

      // Log transaction details
      console.log("Full Transaction Details:", {
        hash: transaction.transactionHash,
        blockNumber: receipt.blockNumber,
      });

      // Reset form and show success
      alert("Music rights successfully created on blockchain!");
      setNewRelease({
        title: "",
        artist: "",
        year: "",
        songFile: null,
        albumCover: null,
        hasInvestors: false,
        investorPercentage: "",
      });
      setIpfsUrls({ songUrl: "", coverUrl: "" });
    } catch (error) {
      let errorMessage = "Failed to create music rights.";
      if (error.message.includes("user rejected transaction")) {
        errorMessage = "Transaction was rejected. Please try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds. Please add more funds to your wallet.";
      } else if (error.message.includes("wallet not connected")) {
        errorMessage = "Wallet not connected. Please connect your wallet.";
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: files[0],
    }));
  };

  const handleInvestorToggle = (e) => {
    setNewRelease((prevState) => ({
      ...prevState,
      hasInvestors: e.target.checked,
      investorPercentage: e.target.checked ? prevState.investorPercentage : "",
    }));
  };

  // Trigger file input
  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
          Upload Your Music
        </h3>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Form remains the same as in your original code */}
          {/* General Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Song Title */}
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

            {/* Artist Name */}
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

            {/* Release Year */}
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
          </div>

          {/* File Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Song File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Song
              </label>
              <input
                type="file"
                name="songFile"
                ref={songFileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => triggerFileInput(songFileInputRef)}
                className="w-full p-3 bg-[#1A1C1C] text-[#04e3cb] rounded-xl flex items-center justify-center hover:bg-[#252727]"
              >
                <UploadCloud className="mr-2" />
                {newRelease.songFile ? newRelease.songFile.name : "Choose Song"}
              </button>
            </div>

            {/* Album Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Album Cover
              </label>
              <input
                type="file"
                name="albumCover"
                ref={albumCoverInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => triggerFileInput(albumCoverInputRef)}
                className="w-full p-3 bg-[#1A1C1C] text-[#04e3cb] rounded-xl flex items-center justify-center hover:bg-[#252727]"
              >
                <ImageIcon className="mr-2" />
                {newRelease.albumCover ? newRelease.albumCover.name : "Choose Cover"}
              </button>
            </div>
          </div>

          {/* Investor Share Section */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="hasInvestors"
              checked={newRelease.hasInvestors}
              onChange={handleInvestorToggle}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Include Investor Share</label>
            {newRelease.hasInvestors && (
              <input
                type="number"
                name="investorPercentage"
                value={newRelease.investorPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="ml-4 p-2 bg-[#1A1C1C] text-white rounded-xl w-24"
                placeholder="Investor %"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-black py-3 rounded-xl hover:bg-[#03DAC5] transition-colors ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-[#04e3cb]"
            }`}
          >
            {isLoading ? "Uploading..." : "Upload Music Release"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;




// Test Two
import React, { useState, useRef } from "react";
import genres from "../components/Data/genre"; // Correctly import genres
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall, toWei } from "thirdweb";

// ABI imports
import MusicNFTContractABI from "../../ABI/MusicNFT.json";
import ThamaniStreamingPlatformABI from "../../ABI/MusicPlatform.json";

// Contract Addresses
const MUSIC_NFT_CONTRACT_ADDRESS = "0x4Bd7993903cb7c69A6037cb4587DDAa709C1d716";
const THAMANI_STREAMING_PLATFORM_ADDRESS =
  "0xbb9Ae81c1A4d3Dac663593B798Fd3e2aF38AEb87";

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

  const [ipfsUrls, setIpfsUrls] = useState({ songUrl: "", coverUrl: "" });
  const songFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  const { mutate: sendAndConfirmTx } = useSendAndConfirmTransaction();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: files[0],
    }));
  };

  const handleInvestorToggle = (e) => {
    setNewRelease((prevState) => ({
      ...prevState,
      hasInvestors: e.target.checked,
      investorPercentage: e.target.checked ? prevState.investorPercentage : "",
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      !newRelease.title ||
      !newRelease.artist ||
      !newRelease.year ||
      !newRelease.genre ||
      !newRelease.songFile ||
      !newRelease.albumCover
    ) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const songUrl = await uploadToPinata(newRelease.songFile);
      const coverUrl = await uploadToPinata(newRelease.albumCover);

      setIpfsUrls({ songUrl, coverUrl });

      const createMusicRightsCall = prepareContractCall({
        contract: {
          address: MUSIC_NFT_CONTRACT_ADDRESS,
          abi: MusicNFTContractABI,
        },
        method: "createMusicRights",
        params: [
          newRelease.title,
          songUrl,
          newRelease.hasInvestors
            ? Math.round(parseFloat(newRelease.investorPercentage) * 100)
            : 0,
          toWei("0.01"),
          true,
          toWei("1"),
        ],
      });

      const txResult = await sendAndConfirmTx(createMusicRightsCall);
      console.log("Transaction:", txResult);

      alert("Music rights successfully created on blockchain!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to create music rights: ${error.message}`);
    }
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
          Upload Your Music
        </h3>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* General Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Song Title */}
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

            {/* Artist Name */}
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

            {/* Release Year */}
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
            {/* Genre Dropdown */}
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
                <option value="" disabled>
                  Select Genre
                </option>
                {genres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* File Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Song File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Song
              </label>
              <input
                type="file"
                name="songFile"
                ref={songFileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => triggerFileInput(songFileInputRef)}
                className="w-full p-3 bg-[#1A1C1C] text-[#04e3cb] rounded-xl flex items-center justify-center hover:bg-[#252727]"
              >
                <UploadCloud className="mr-2" />
                {newRelease.songFile ? newRelease.songFile.name : "Choose Song"}
              </button>
            </div>

            {/* Album Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Album Cover
              </label>
              <input
                type="file"
                name="albumCover"
                ref={albumCoverInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => triggerFileInput(albumCoverInputRef)}
                className="w-full p-3 bg-[#1A1C1C] text-[#04e3cb] rounded-xl flex items-center justify-center hover:bg-[#252727]"
              >
                <ImageIcon className="mr-2" />
                {newRelease.albumCover
                  ? newRelease.albumCover.name
                  : "Choose Cover"}
              </button>
            </div>
          </div>

          {/* Investor Share Section */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="hasInvestors"
              checked={newRelease.hasInvestors}
              onChange={handleInvestorToggle}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">
              Include Investor Share
            </label>
            {newRelease.hasInvestors && (
              <input
                type="number"
                name="investorPercentage"
                value={newRelease.investorPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="ml-4 p-2 bg-[#1A1C1C] text-white rounded-xl w-28"
                placeholder="Investor %"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#04e3cb] text-black py-3 rounded-xl hover:bg-[#03DAC5] transition-colors"
          >
            Upload Music Release
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;

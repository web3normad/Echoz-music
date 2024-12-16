no nau this is my current upload music code "import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useWriteContract, useContractWrite } from "wagmi";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
    genre: "",
    songFile: null,
    albumCover: null,
    hasInvestors: false,
    investorPercentage: "",
  });

  const [ipfsUrls, setIpfsUrls] = useState({ songUrl: "", coverUrl: "" });
  const [isUploading, setIsUploading] = useState(false);
  const songFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  // Updated mutation implementation for React Query v5
  const uploadToPinata = async (file) => {
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
  };

  const pinataUploadMutation = useMutation({
    mutationFn: uploadToPinata,
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to upload file: ${error.message}`);
      setIsUploading(false);
    },
    onSuccess: (data, variables) => {
      // Determine if it's song or cover based on the file type
      if (variables.type === 'song') {
        setIpfsUrls(prevState => ({ ...prevState, songUrl: data }));
      } else {
        setIpfsUrls(prevState => ({ ...prevState, coverUrl: data }));
      }
    },
  });

  const { config } = useWriteContract({
    address: MUSIC_NFT_CONTRACT_ADDRESS,
    abi: MusicNFTContractABI,
    functionName: "createMusicRights",
    args: [
      newRelease.title,
      ipfsUrls.songUrl,
      newRelease.hasInvestors ? Math.round(parseFloat(newRelease.investorPercentage) * 100) : 0,
      ethers.utils.parseUnits("0.01", "ether"),
      true,
      ethers.utils.parseUnits("1", "ether"),
    ],
    enabled: !!ipfsUrls.songUrl && !!ipfsUrls.coverUrl,
  });

  const { write } = useContractWrite(config);

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
    setIsUploading(true);

    if (
      !newRelease.title ||
      !newRelease.artist ||
      !newRelease.year ||
      !newRelease.genre ||
      !newRelease.songFile ||
      !newRelease.albumCover
    ) {
      toast.error("Please fill out all fields.");
      setIsUploading(false);
      return;
    }

    try {
      // Add type property to files for correct handling in mutation
      const songFile = { ...newRelease.songFile, type: 'song' };
      const coverFile = { ...newRelease.albumCover, type: 'cover' };

      const songUrl = await pinataUploadMutation.mutateAsync(songFile);
      const coverUrl = await pinataUploadMutation.mutateAsync(coverFile);

      setIpfsUrls({ songUrl, coverUrl });

      write?.();
      toast.success("Music rights successfully created on blockchain!");

      // Reset the form
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

      // Manually reset file inputs
      songFileInputRef.current.value = null;
      albumCoverInputRef.current.value = null;
    } catch (error) {
      console.error(error);
      toast.error(`Failed to create music rights: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ToastContainer />
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
          Upload Your Music
        </h3>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <button
            type="submit"
            className="w-full bg-[#04e3cb] text-black py-3 rounded-xl hover:bg-[#03DAC5] transition-colors"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Music Release"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;"
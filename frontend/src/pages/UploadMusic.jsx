import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ABI imports
import MusicNFTContractABI from "../../ABI/MusicNFT.json";

// Contract Addresses
const MUSIC_NFT_CONTRACT_ADDRESS = "0x4Bd7993903cb7c69A6037cb4587DDAa709C1d716";

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
    setNewRelease((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const uploadToPinata = async ({ file, type }) => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file passed to uploadToPinata");
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      const metadata = JSON.stringify({
        name: type === "song" ? "Uploaded Song" : "Album Cover",
        keyvalues: {
          type: type,
        },
      });
  
      formData.append("pinataMetadata", metadata);
  
      const options = JSON.stringify({
        cidVersion: 1,
      });
  
      formData.append("pinataOptions", options);
  
      // Pinata API URL
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`, // Use your environment variable
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
      return result.IpfsHash; // Return the IPFS hash
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
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
  
    // Validate required fields
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
      console.log("Uploading Song File:", newRelease.songFile);
      console.log("Uploading Album Cover:", newRelease.albumCover);
  
      // Upload the song file
      const songFileURL = await pinataUploadMutation.mutateAsync({
        file: newRelease.songFile,
        type: "song",
      });
  
      // Upload the album cover
      const albumCoverURL = await pinataUploadMutation.mutateAsync({
        file: newRelease.albumCover,
        type: "cover",
      });
  
      toast.success("Files uploaded successfully to Pinata!");
      console.log("Song File URL:", songFileURL);
      console.log("Album Cover URL:", albumCoverURL);
  
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
  
      // Clear file input fields
      songFileInputRef.current.value = null;
      albumCoverInputRef.current.value = null;
    } catch (error) {
      console.error(error);
      toast.error("File upload failed!");
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
          {/* Investor share logic */}
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

export default UploadMusic;

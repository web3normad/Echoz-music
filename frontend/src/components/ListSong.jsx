import React, { useState } from "react";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import StreamingPlatformABI from "../../ABI/MusicPlatform.json";

const STREAMING_PLATFORM_ADDRESS = "0xbb9Ae81c1A4d3Dac663593B798Fd3e2aF38AEb87";

function ListSong() {
  const { contract } = useContract(STREAMING_PLATFORM_ADDRESS, StreamingPlatformABI);

  const { mutate: listSong, isLoading: isListing } = useContractWrite(contract, "listSong");

  const [metadataURI, setMetadataURI] = useState("");
  const [streamRate, setStreamRate] = useState("");
  const [rightsOwnerCut, setRightsOwnerCut] = useState("");
  const [sponsorSplitManager, setSponsorSplitManager] = useState("");

  const handleListSong = async () => {
    try {
      await listSong({
        args: [
          metadataURI, 
          parseInt(streamRate), 
          parseInt(rightsOwnerCut), 
          sponsorSplitManager
        ],
      });
      alert("Song listed successfully!");
    } catch (error) {
      console.error("Error listing song:", error);
      alert("Failed to list the song.");
    }
  };

  return (
    <div>
      <h2>List a Song</h2>
      <div>
        <label>Metadata URI</label>
        <input
          type="text"
          value={metadataURI}
          onChange={(e) => setMetadataURI(e.target.value)}
          placeholder="Enter metadata URI"
        />
      </div>

      <div>
        <label>Stream Rate</label>
        <input
          type="number"
          value={streamRate}
          onChange={(e) => setStreamRate(e.target.value)}
          placeholder="Enter stream rate"
        />
      </div>

      <div>
        <label>Rights Owner Cut (%)</label>
        <input
          type="number"
          value={rightsOwnerCut}
          onChange={(e) => setRightsOwnerCut(e.target.value)}
          placeholder="Enter rights owner cut"
        />
      </div>

      <div>
        <label>Sponsor Split Manager Address</label>
        <input
          type="text"
          value={sponsorSplitManager}
          onChange={(e) => setSponsorSplitManager(e.target.value)}
          placeholder="Enter sponsor split manager address"
        />
      </div>

      <button onClick={handleListSong} disabled={isListing}>
        {isListing ? "Listing Song..." : "List Song"}
      </button>
    </div>
  );
}

export default ListSong;

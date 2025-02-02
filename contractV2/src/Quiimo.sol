// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MusicSharePlatform is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _songIds;

    // Struct to represent a music track
    struct MusicTrack {
        address artist;
        string name;
        string genre;
        string ipfsAudioHash;
        string ipfsArtworkHash;
        uint256 totalShares;
        uint256 sharePrice;
        uint256 releasedDate;
        uint256 totalRevenue;
        mapping(address => uint256) shareholderShares;
        address[] shareholders;
    }

    // Mapping of song ID to MusicTrack
    mapping(uint256 => MusicTrack) public musicTracks;

    // Array to keep track of all song IDs
    uint256[] public allSongIds;

    // Events for tracking key actions
    event SongUploaded(
        uint256 indexed songId, 
        address indexed artist, 
        string name, 
        string genre, 
        uint256 totalShares, 
        uint256 sharePrice
    );
    
    event SharePurchased(
        uint256 indexed songId, 
        address indexed investor, 
        uint256 sharesBought
    );
    
    event RevenueDistributed(
        uint256 indexed songId, 
        uint256 totalRevenue
    );

   
    constructor() 
        ERC721("MusicShareNFT", "MSHARE") 
        Ownable(msg.sender) 
    {}

    // Function to upload a new song
    function uploadSong(
        string memory _name,
        string memory _genre,
        string memory _ipfsAudioHash,
        string memory _ipfsArtworkHash,
        uint256 _totalShares,
        uint256 _sharePrice
    ) public returns (uint256) {
        require(_totalShares > 0, "Total shares must be greater than zero");
        require(_sharePrice > 0, "Share price must be greater than zero");

        // Increment song ID
        _songIds.increment();
        uint256 newSongId = _songIds.current();

        // Create the music track
        MusicTrack storage newTrack = musicTracks[newSongId];
        newTrack.artist = msg.sender;
        newTrack.name = _name;
        newTrack.genre = _genre;
        newTrack.ipfsAudioHash = _ipfsAudioHash;
        newTrack.ipfsArtworkHash = _ipfsArtworkHash;
        newTrack.totalShares = _totalShares;
        newTrack.sharePrice = _sharePrice;
        newTrack.releasedDate = block.timestamp;

        // Add song ID to the array of all song IDs
        allSongIds.push(newSongId);

        // Emit event for song upload
        emit SongUploaded(
            newSongId, 
            msg.sender, 
            _name, 
            _genre, 
            _totalShares, 
            _sharePrice
        );

        return newSongId;
    }

    // New function to get all song IDs
    function getAllSongIds() public view returns (uint256[] memory) {
        return allSongIds;
    }

    // Rest of the contract remains the same as in the original implementation
    // (buyShares, distributeRevenue, getSongDetails, getShareholders, receive functions)
    
    // Function to buy shares of a song
    function buyShares(
        uint256 _songId, 
        uint256 _sharesCount
    ) public payable {
        MusicTrack storage track = musicTracks[_songId];
        
        // Validate purchase
        require(_sharesCount > 0, "Must buy at least one share");
        require(track.totalShares >= _sharesCount, "Not enough shares available");
        require(msg.value >= track.sharePrice * _sharesCount, "Insufficient payment");

        // Update track shares
        track.totalShares -= _sharesCount;
        track.shareholderShares[msg.sender] += _sharesCount;

        // Add investor to shareholders if not already present
        bool isNewShareholder = true;
        for (uint i = 0; i < track.shareholders.length; i++) {
            if (track.shareholders[i] == msg.sender) {
                isNewShareholder = false;
                break;
            }
        }
        if (isNewShareholder) {
            track.shareholders.push(msg.sender);
        }

        // Mint NFT to represent ownership
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        
        // Set token URI to IPFS artwork
        _setTokenURI(newTokenId, track.ipfsArtworkHash);

        // Emit share purchase event
        emit SharePurchased(_songId, msg.sender, _sharesCount);
    }

    // Function to distribute revenue
    function distributeRevenue(uint256 _songId) public payable {
        MusicTrack storage track = musicTracks[_songId];
        require(msg.sender == track.artist, "Only artist can distribute revenue");
        
        uint256 totalRevenue = msg.value;
        track.totalRevenue += totalRevenue;

        // Distribute revenue proportionally to shareholders
        for (uint i = 0; i < track.shareholders.length; i++) {
            address shareholder = track.shareholders[i];
            uint256 shareholderShares = track.shareholderShares[shareholder];
            
            // Calculate shareholder's cut
            uint256 shareholderRevenue = (shareholderShares * totalRevenue) / 
                                         (track.totalShares + shareholderShares);
            
            // Transfer revenue to shareholders
            payable(shareholder).transfer(shareholderRevenue);
        }

        emit RevenueDistributed(_songId, totalRevenue);
    }

    // Function to get song details
    function getSongDetails(uint256 _songId) public view returns (
        address artist,
        string memory name,
        string memory genre,
        string memory ipfsAudioHash,
        string memory ipfsArtworkHash,
        uint256 totalShares,
        uint256 sharePrice,
        uint256 releasedDate
    ) {
        MusicTrack storage track = musicTracks[_songId];
        return (
            track.artist,
            track.name,
            track.genre,
            track.ipfsAudioHash,
            track.ipfsArtworkHash,
            track.totalShares,
            track.sharePrice,
            track.releasedDate
        );
    }

    // Function to get shareholder details
    function getShareholders(uint256 _songId) public view returns (
        address[] memory shareholders,
        uint256[] memory shares
    ) {
        MusicTrack storage track = musicTracks[_songId];
        uint256[] memory shareholderShares = new uint256[](track.shareholders.length);
        
        for (uint i = 0; i < track.shareholders.length; i++) {
            shareholderShares[i] = track.shareholderShares[track.shareholders[i]];
        }
        
        return (track.shareholders, shareholderShares);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
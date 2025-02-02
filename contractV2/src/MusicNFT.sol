// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MusicNFT is ERC1155Supply, Ownable, ReentrancyGuard, Pausable, IERC2981 {
    // Custom Errors
    error InsufficientShares(uint256 available, uint256 requested);
    error InvalidPayment(uint256 required, uint256 sent);
    error FullRightsSaleNotAllowed();
    error UnauthorizedAction();
    error InvalidRoyaltyPercentage();

    // Music Rights Structure
      struct MusicRights {
        uint256 id;
        address artist;
        string title;
        string metadataURI;
        uint256 totalShares;
        uint256 availableShares;
        uint256 sharePrice;
        bool isFullRightsSale;
        uint256 fullRightsPrice;
        uint96 royaltyPercentage; 
    }


    // State Variables
    uint256 private _musicReleaseCounter;
    mapping(uint256 => MusicRights) private _musicRights;
    mapping(uint256 => address[]) private _investors;
    mapping(uint256 => mapping(address => uint256)) private _investorShares;
    mapping(uint256 => uint256) private _totalRevenueByRelease;

    // Constants
    uint256 private constant MAX_ROYALTY_PERCENTAGE = 10000; 
    uint256 private constant MAX_SHARES = 1_000_000; 

    // Events
    event MusicRightsCreated(
        uint256 indexed releaseId, 
        address indexed artist, 
        string title, 
        uint256 totalShares,
        uint96 royaltyPercentage
    );

    event SharesPurchased(
        uint256 indexed releaseId, 
        address indexed investor, 
        uint256 sharesPurchased,
        uint256 totalPaid
    );

    event FullRightsSold(
        uint256 indexed releaseId, 
        address indexed previousArtist,
        address indexed newArtist, 
        uint256 price
    );

    event MetadataUpdated(
        uint256 indexed releaseId, 
        string newMetadataURI
    );

    event FundsWithdrawn(
        address indexed recipient, 
        uint256 amount
    );

     event SharesTransferred(
        uint256 indexed releaseId,
        address indexed from,
        address indexed to,
        uint256 shareAmount
    );

    constructor(string memory _baseURI) 
        ERC1155(_baseURI) 
        Ownable(msg.sender) 
    {}

    // Music Rights Creation
 function createMusicRights(
        string memory _title,
        string memory _ipfsHash,
        uint256 _totalShares,
        uint256 _sharePrice,
        bool _allowFullRightsSale,
        uint256 _fullRightsPrice
    ) public whenNotPaused returns (uint256) {
        // Validate inputs
        if (_totalShares == 0 || _totalShares > MAX_SHARES)
            revert InsufficientShares(0, _totalShares);

        // Default royalty percentage
        uint96 _royaltyPercentage = 500; // 5% default royalty

        // Increment and get new release ID
        unchecked { _musicReleaseCounter++; }
        uint256 newReleaseId = _musicReleaseCounter;

        // Create Music Rights
        _musicRights[newReleaseId] = MusicRights({
            id: newReleaseId,
            artist: msg.sender, 
            title: _title,
            metadataURI: _ipfsHash, 
            totalShares: _totalShares,
            availableShares: _totalShares,
            sharePrice: _sharePrice,
            isFullRightsSale: _allowFullRightsSale,
            fullRightsPrice: _fullRightsPrice,
            royaltyPercentage: _royaltyPercentage
        });

        emit MusicRightsCreated(
            newReleaseId,
            msg.sender,
            _title,
            _totalShares,
            _royaltyPercentage
        );

        return newReleaseId;
    }

    // Purchase Music Shares
    function purchaseShares(
        uint256 _releaseId, 
        uint256 _shareAmount
    ) public payable whenNotPaused nonReentrant {
        MusicRights storage rights = _musicRights[_releaseId];
        
        // Validate purchase
        if (rights.availableShares < _shareAmount) 
            revert InsufficientShares(rights.availableShares, _shareAmount);
        
        uint256 totalCost = _shareAmount * rights.sharePrice;
        if (msg.value < totalCost) 
            revert InvalidPayment(totalCost, msg.value);

        // Track investor
        if (_investorShares[_releaseId][msg.sender] == 0) {
            _investors[_releaseId].push(msg.sender);
        }

        // Update shares and revenue
        _investorShares[_releaseId][msg.sender] += _shareAmount;
        rights.availableShares -= _shareAmount;
        _totalRevenueByRelease[_releaseId] += totalCost;

        // Mint shares
        _mint(msg.sender, _releaseId, _shareAmount, "");

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit SharesPurchased(_releaseId, msg.sender, _shareAmount, totalCost);
    }

      function transferShares(
        uint256 _releaseId,
        address _to,
        uint256 _shareAmount
    ) public whenNotPaused {
        require(balanceOf(msg.sender, _releaseId) >= _shareAmount, "Insufficient balance");
        require(_to != address(0), "Invalid recipient");

        // Perform the transfer
        safeTransferFrom(msg.sender, _to, _releaseId, _shareAmount, "");

        // Update investor shares
        _investorShares[_releaseId][msg.sender] -= _shareAmount;
        if (_investorShares[_releaseId][_to] == 0) {
            _investors[_releaseId].push(_to);
        }
        _investorShares[_releaseId][_to] += _shareAmount;

        emit SharesTransferred(_releaseId, msg.sender, _to, _shareAmount);
    }



    // Purchase Full Rights
    function purchaseFullRights(uint256 _releaseId) 
        public 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        MusicRights storage rights = _musicRights[_releaseId];
        
        // Validate full rights sale
        if (!rights.isFullRightsSale) 
            revert FullRightsSaleNotAllowed();
        
        if (msg.value < rights.fullRightsPrice) 
            revert InvalidPayment(rights.fullRightsPrice, msg.value);

        // Store previous artist
        address previousArtist = rights.artist;

        // Transfer full ownership
        rights.artist = msg.sender;
        rights.availableShares = 0;
        rights.isFullRightsSale = false;

        emit FullRightsSold(
            _releaseId, 
            previousArtist, 
            msg.sender, 
            msg.value
        );
    }

    // Royalty Implementation (ERC2981)
    function royaltyInfo(
        uint256 _tokenId, 
        uint256 _salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        MusicRights memory rights = _musicRights[_tokenId];
        royaltyAmount = (_salePrice * rights.royaltyPercentage) / MAX_ROYALTY_PERCENTAGE;
        return (rights.artist, royaltyAmount);
    }

    // Metadata Update
    function updateMetadata(
        uint256 _releaseId, 
        string memory _newURI
    ) public {
        MusicRights storage rights = _musicRights[_releaseId];
        if (rights.artist != msg.sender) 
            revert UnauthorizedAction();

        rights.metadataURI = _newURI;
        emit MetadataUpdated(_releaseId, _newURI);
    }

    // Funds Withdrawal
    function withdrawFunds() public nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, balance);
    }

    // Administrative Functions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // View Functions
    function getMusicRights(uint256 _releaseId) 
        public 
        view 
        returns (MusicRights memory) 
    {
        return _musicRights[_releaseId];
    }

    function getInvestors(uint256 _releaseId) 
        public 
        view 
        returns (address[] memory) 
    {
        return _investors[_releaseId];
    }

    function getInvestorShares(
        uint256 _releaseId, 
        address _investor
    ) public view returns (uint256) {
        return _investorShares[_releaseId][_investor];
    }

    // Override URI function
    function uri(uint256 _releaseId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        return _musicRights[_releaseId].metadataURI;
    }
}
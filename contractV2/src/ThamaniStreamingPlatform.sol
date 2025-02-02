// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MusicNFT.sol";
import "./PlatformToken.sol";

contract ThamaniStreamingPlatform is Ownable, ReentrancyGuard {
    // New Structs for IPFS Music Upload
    struct MusicMetadata {
        uint256 id;
        address artist;
        string title;
        string genre;
        string ipfsHash;
        uint256 uploadTimestamp;
        uint16 uploadMonth;
        uint16 uploadYear;
        uint256 totalShares;
        uint256 sharePrice;
    }

    // Subscription Tiers
    enum SubscriptionTier {
        Free,
        Basic,
        Premium,
        Ultimate
    }

    // Subscription Structure
    struct Subscription {
        SubscriptionTier tier;
        uint256 startTimestamp;
        uint256 expiryTimestamp;
        bool isActive;
    }

    // Streaming Revenue Share Configuration
    struct RevenueShareConfig {
        uint256 platformShare;
        uint256 artistShare;
        uint256 investorShare;
    }

    // Streaming Revenue Subscribtion Configuration
    struct StreamRevenueConfig {
        uint256 baseStreamRate;
        uint256 subscriptionMultiplier;
        uint256 qualityMultiplier;
        uint256 listenerLocationMultiplier;
    }

    // Listener Rewards Configuration
    struct ListenerRewardsConfig {
        uint256 firstPlaceReward;
        uint256 secondPlaceReward;
        uint256 thirdPlaceReward;
        bool isEnabled;
    }

    // Contracts
    MusicNFT public musicNFT;
    Quiimo public platformToken;

    // Mappings for Music Metadata
    mapping(uint256 => MusicMetadata) public musicCatalog;
    uint256 public musicCounter;

    // Subscription Management
    mapping(address => Subscription) public userSubscriptions;
    mapping(SubscriptionTier => uint256) public tierPrices;
    mapping(SubscriptionTier => uint256) public maxMonthlyListeningMinutes;

    // Revenue Tracking
    mapping(uint256 => uint256) public songStreamRevenue;
    mapping(uint256 => RevenueShareConfig) public songRevenueShares;

    // Mapping to store stream revenue configurations
    mapping(uint256 => StreamRevenueConfig) public musicReleaseStreamConfig;

    // Global platform stream rate configuration
    StreamRevenueConfig public globalStreamRateConfig;

    ListenerRewardsConfig public listenerRewardsConfig;

    //Listener Stream Tracking
    mapping(address => uint256) public listenerStreamCounts;
    mapping(uint256 => mapping(address => uint256))
        public monthlyListenerStreamCounts;
    mapping(uint256 => address[]) private monthlyListenerAddresses;

    // Events

    // Event for Music Upload
    event MusicUploaded(
        uint256 indexed musicId,
        address indexed artist,
        string title,
        string genre,
        string ipfsHash,
        uint256 totalShares,
        uint256 sharePrice
    );

    event SubscriptionPurchased(
        address indexed user,
        SubscriptionTier tier,
        uint256 startTimestamp,
        uint256 expiryTimestamp
    );

    event SongStreamed(
        uint256 indexed musicReleaseId,
        address indexed listener,
        uint256 streamRevenue
    );

    event RevenueDistributed(
        uint256 indexed musicReleaseId,
        address indexed artist,
        uint256 artistRevenue,
        address[] investors,
        uint256[] investorRevenues
    );

    event StreamRevenueConfigUpdated(
        uint256 indexed musicReleaseId,
        StreamRevenueConfig newConfig
    );

    event GlobalStreamRateConfigUpdated(StreamRevenueConfig newConfig);

    //Listener Rewards Events
    event ListenerRewardsConfigUpdated(
        uint256 firstPlaceReward,
        uint256 secondPlaceReward,
        uint256 thirdPlaceReward,
        bool isEnabled
    );

    event TopListenersRewarded(
        address firstPlace,
        address secondPlace,
        address thirdPlace,
        uint256 firstPlaceReward,
        uint256 secondPlaceReward,
        uint256 thirdPlaceReward
    );

    constructor(
        address _musicNFTAddress,
        address _platformTokenAddress
    ) Ownable(msg.sender) {
   
        musicNFT = MusicNFT(_musicNFTAddress);
        platformToken = Quiimo(_platformTokenAddress);

        tierPrices[SubscriptionTier.Free] = 0;
        tierPrices[SubscriptionTier.Basic] = 10 * 10 ** 18;
        tierPrices[SubscriptionTier.Premium] = 25 * 10 ** 18;
        tierPrices[SubscriptionTier.Ultimate] = 50 * 10 ** 18;

        maxMonthlyListeningMinutes[SubscriptionTier.Free] = 60;
        maxMonthlyListeningMinutes[SubscriptionTier.Basic] = 300;
        maxMonthlyListeningMinutes[SubscriptionTier.Premium] = 1500;
        maxMonthlyListeningMinutes[SubscriptionTier.Ultimate] = 3000;

        globalStreamRateConfig = StreamRevenueConfig({
            baseStreamRate: 5 * 10 ** 17,
            subscriptionMultiplier: 20,
            qualityMultiplier: 10,
            listenerLocationMultiplier: 5
        });

        // Initialize listener rewards config
        listenerRewardsConfig = ListenerRewardsConfig({
            firstPlaceReward: 100 * 10 ** 18,
            secondPlaceReward: 50 * 10 ** 18,
            thirdPlaceReward: 25 * 10 ** 18,
            isEnabled: true
        });
    }

    function uploadMusic(
    string memory _title,
    string memory _ipfsHash,
    string memory _genre,
    uint256 _totalShares,
    uint256 _sharePrice
) public returns (uint256) {
    // Increment music counter
    musicCounter++;
    
    // Create music metadata
    MusicMetadata memory newMusic = MusicMetadata({
        id: musicCounter,
        artist: msg.sender,
        title: _title,
        genre: _genre,
        ipfsHash: _ipfsHash,
        uploadTimestamp: block.timestamp,
        uploadMonth: uint16(((block.timestamp / 30 days) % 12) + 1),
        uploadYear: uint16(block.timestamp / 365 days + 1970),
        totalShares: _totalShares,
        sharePrice: _sharePrice
    });
    
    // Store music metadata
    musicCatalog[musicCounter] = newMusic;
    
    // Mint initial NFT for the music rights
    uint256 musicReleaseId = musicNFT.createMusicRights(
        _title,
        _ipfsHash,
        _totalShares,
        _sharePrice,
        true,  
        _totalShares * _sharePrice  
    );
    
    // Emit event
    emit MusicUploaded(
        musicCounter,
        msg.sender,
        _title,
        _genre,
        _ipfsHash,
        _totalShares,
        _sharePrice
    );
    
    return musicCounter;
}
    // Function to buy music shares
    function buyMusicShares(uint256 _musicId, uint256 _shareAmount) public {
        MusicMetadata storage music = musicCatalog[_musicId];
        require(music.id != 0, "Music does not exist");
        require(_shareAmount > 0, "Invalid share amount");
        require(
            _shareAmount <= music.totalShares,
            "Insufficient shares available"
        );

        // Calculate total cost
        uint256 totalCost = music.sharePrice * _shareAmount;

        // Transfer payment to artist
        platformToken.transferFrom(msg.sender, music.artist, totalCost);

        // Mint NFT shares to buyer
        musicNFT.transferShares(_musicId, msg.sender, _shareAmount);
    }

    // Function to get all music for explore page
    function getAllMusic() public view returns (MusicMetadata[] memory) {
        MusicMetadata[] memory allMusic = new MusicMetadata[](musicCounter);

        for (uint256 i = 1; i <= musicCounter; i++) {
            allMusic[i - 1] = musicCatalog[i];
        }

        return allMusic;
    }

    // Function to get music by artist
    function getMusicByArtist(
        address _artist
    ) public view returns (MusicMetadata[] memory) {
        uint256 artistMusicCount = 0;

        // First count the number of musics by the artist
        for (uint256 i = 1; i <= musicCounter; i++) {
            if (musicCatalog[i].artist == _artist) {
                artistMusicCount++;
            }
        }

        // Create array to store artist's music
        MusicMetadata[] memory artistMusic = new MusicMetadata[](
            artistMusicCount
        );

        // Populate the array
        uint256 index = 0;
        for (uint256 i = 1; i <= musicCounter; i++) {
            if (musicCatalog[i].artist == _artist) {
                artistMusic[index] = musicCatalog[i];
                index++;
            }
        }

        return artistMusic;
    }

    // Additional function to retrieve music details for streaming
    function getMusicDetails(
        uint256 _musicId
    )
        public
        view
        returns (
            string memory title,
            string memory ipfsHash,
            address artist,
            uint256 totalShares
        )
    {
        MusicMetadata memory music = musicCatalog[_musicId];
        require(music.id != 0, "Music does not exist");

        return (music.title, music.ipfsHash, music.artist, music.totalShares);
    }

    // Purchase subscription
    function purchaseSubscription(SubscriptionTier _tier) public {
        require(
            _tier != SubscriptionTier.Free,
            "Use free tier without purchase"
        );

        uint256 subscriptionCost = tierPrices[_tier];

        // Transfer tokens for subscription
        platformToken.transferFrom(msg.sender, address(this), subscriptionCost);

        // Create/Update subscription
        userSubscriptions[msg.sender] = Subscription({
            tier: _tier,
            startTimestamp: block.timestamp,
            expiryTimestamp: block.timestamp + 30 days,
            isActive: true
        });

        emit SubscriptionPurchased(
            msg.sender,
            _tier,
            block.timestamp,
            block.timestamp + 30 days
        );
    }

   function setRevenueShareConfig(
    uint256 _musicReleaseId,
    uint256 _platformShare,
    uint256 _artistShare,
    uint256 _investorShare
) public {
    require(
        _platformShare + _artistShare + _investorShare == 100,
        "Invalid revenue share percentages"
    );

    // Retrieve the music rights directly from the musicNFT contract
    MusicNFT.MusicRights memory musicRightsData = musicNFT.getMusicRights(_musicReleaseId);

    require(
        musicRightsData.artist == msg.sender || msg.sender == owner(),
        "Unauthorized"
    );

    // Set the revenue share configuration
    songRevenueShares[_musicReleaseId] = RevenueShareConfig({
        platformShare: _platformShare,
        artistShare: _artistShare,
        investorShare: _investorShare
    });
}

    // Stream a song
    function streamSong(uint256 _musicReleaseId) public {
        Subscription storage subscription = userSubscriptions[msg.sender];

        require(
            subscription.isActive &&
                block.timestamp <= subscription.expiryTimestamp,
            "Invalid or expired subscription"
        );

        uint256 streamRevenue = calculateStreamRevenue(
            _musicReleaseId,
            msg.sender
        );
        songStreamRevenue[_musicReleaseId] += streamRevenue;

        listenerStreamCounts[msg.sender] += 1;
        uint256 currentMonthKey = _getCurrentMonthKey();
        monthlyListenerStreamCounts[currentMonthKey][msg.sender] += 1;

        _addListenerToMonthlyTracking(currentMonthKey, msg.sender);

        emit SongStreamed(_musicReleaseId, msg.sender, streamRevenue);
    }

    function _addListenerToMonthlyTracking(
        uint256 _monthKey,
        address _listener
    ) internal {
        bool exists = false;
        for (
            uint256 i = 0;
            i < monthlyListenerAddresses[_monthKey].length;
            i++
        ) {
            if (monthlyListenerAddresses[_monthKey][i] == _listener) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            monthlyListenerAddresses[_monthKey].push(_listener);
        }
    }

    // Distribute streaming revenue
 function distributeStreamingRevenue(uint256 _musicReleaseId) public {
    RevenueShareConfig memory shareConfig = songRevenueShares[_musicReleaseId];
    uint256 totalRevenue = songStreamRevenue[_musicReleaseId];

    // Calculate revenues based on share percentages
    uint256 platformRevenue = (totalRevenue * shareConfig.platformShare) / 100;
    uint256 artistRevenue = (totalRevenue * shareConfig.artistShare) / 100;
    uint256 investorTotalRevenue = (totalRevenue * shareConfig.investorShare) / 100;

    // Get music rights using getMusicRights method
    MusicNFT.MusicRights memory musicRightsData = musicNFT.getMusicRights(_musicReleaseId);
    address artist = musicRightsData.artist;

    // Distribute to artist
    platformToken.transfer(artist, artistRevenue);

    // Distribute to investors
    address[] memory investorAddresses = musicNFT.getInvestors(_musicReleaseId);
    uint256[] memory investorRevenues = new uint256[](investorAddresses.length);

    uint256 totalShares = musicRightsData.totalShares;

    for (uint256 i = 0; i < investorAddresses.length; i++) {
        uint256 investorShares = musicNFT.getInvestorShares(
            _musicReleaseId,
            investorAddresses[i]
        );
        uint256 investorRevenue = (investorTotalRevenue * investorShares) / totalShares;

        platformToken.transfer(investorAddresses[i], investorRevenue);
        investorRevenues[i] = investorRevenue;
    }

    emit RevenueDistributed(
        _musicReleaseId,
        artist,
        artistRevenue,
        investorAddresses,
        investorRevenues
    );

    // Reset streamed revenue after distribution
    songStreamRevenue[_musicReleaseId] = 0;
}

    // Stream revenue calculation
    function calculateStreamRevenue(
        uint256 _musicReleaseId,
        address _listener
    ) internal view returns (uint256) {
        StreamRevenueConfig memory config = musicReleaseStreamConfig[
            _musicReleaseId
        ];

        if (config.baseStreamRate == 0) {
            config = globalStreamRateConfig;
        }

        // Base rate calculation
        uint256 streamRevenue = config.baseStreamRate;

        // Subscription tier multiplier
        Subscription storage subscription = userSubscriptions[_listener];
        uint256 subscriptionMultiplier;

        // Determine subscription multiplier based on tier
        if (subscription.tier == SubscriptionTier.Ultimate) {
            subscriptionMultiplier = config.subscriptionMultiplier * 4;
        } else if (subscription.tier == SubscriptionTier.Premium) {
            subscriptionMultiplier = config.subscriptionMultiplier * 3;
        } else if (subscription.tier == SubscriptionTier.Basic) {
            subscriptionMultiplier = config.subscriptionMultiplier * 2;
        } else {
            subscriptionMultiplier = config.subscriptionMultiplier;
        }

        // Apply subscription multiplier
        streamRevenue += (streamRevenue * subscriptionMultiplier) / 100;
        streamRevenue += (streamRevenue * config.qualityMultiplier) / 100;
        streamRevenue +=
            (streamRevenue * config.listenerLocationMultiplier) /
            100;

        return streamRevenue;
    }

    // function setMusicReleaseStreamConfig(
    //     uint256 _musicReleaseId,
    //     uint256 _baseStreamRate,
    //     uint256 _subscriptionMultiplier,
    //     uint256 _qualityMultiplier,
    //     uint256 _listenerLocationMultiplier
    // ) public {
    //     (, /* uint256 id */ address artist, , , , , , , ) = /* string memory title */ /* string memory metadataURI */ /* uint256 totalShares */ /* uint256 availableShares */ /* uint256 sharePrice */ /* bool isFullRightsSale */ /* uint256 fullRightsPrice */
    //     musicNFT.musicRights(_musicReleaseId);

    //     // Require that either the artist or the owner can set the config
    //     require(
    //         artist == msg.sender || msg.sender == owner(),
    //         "Unauthorized to set stream revenue config"
    //     );

    //     StreamRevenueConfig memory newConfig = StreamRevenueConfig({
    //         baseStreamRate: _baseStreamRate,
    //         subscriptionMultiplier: _subscriptionMultiplier,
    //         qualityMultiplier: _qualityMultiplier,
    //         listenerLocationMultiplier: _listenerLocationMultiplier
    //     });

    //     musicReleaseStreamConfig[_musicReleaseId] = newConfig;

    //     emit StreamRevenueConfigUpdated(_musicReleaseId, newConfig);
    // }

    // Function to set global stream revenue configuration (platform-wide)
    function setGlobalStreamRateConfig(
        uint256 _baseStreamRate,
        uint256 _subscriptionMultiplier,
        uint256 _qualityMultiplier,
        uint256 _listenerLocationMultiplier
    ) public onlyOwner {
        StreamRevenueConfig memory newConfig = StreamRevenueConfig({
            baseStreamRate: _baseStreamRate,
            subscriptionMultiplier: _subscriptionMultiplier,
            qualityMultiplier: _qualityMultiplier,
            listenerLocationMultiplier: _listenerLocationMultiplier
        });

        globalStreamRateConfig = newConfig;

        emit GlobalStreamRateConfigUpdated(newConfig);
    }

    // Listener Rewards Configuration
    function setListenerRewardsConfig(
        uint256 _firstPlaceReward,
        uint256 _secondPlaceReward,
        uint256 _thirdPlaceReward,
        bool _isEnabled
    ) public onlyOwner {
        listenerRewardsConfig = ListenerRewardsConfig({
            firstPlaceReward: _firstPlaceReward,
            secondPlaceReward: _secondPlaceReward,
            thirdPlaceReward: _thirdPlaceReward,
            isEnabled: _isEnabled
        });

        emit ListenerRewardsConfigUpdated(
            _firstPlaceReward,
            _secondPlaceReward,
            _thirdPlaceReward,
            _isEnabled
        );
    }

    function distributeTopListenerRewards() public onlyOwner {
        require(
            listenerRewardsConfig.isEnabled,
            "Listener rewards are not enabled"
        );

        uint256 currentMonthKey = _getCurrentMonthKey();

        // Find top 3 listeners
        address[3] memory topListeners = _findTopThreeListeners(
            currentMonthKey
        );

        // Distribute rewards
        if (topListeners[0] != address(0)) {
            platformToken.transfer(
                topListeners[0],
                listenerRewardsConfig.firstPlaceReward
            );
        }
        if (topListeners[1] != address(0)) {
            platformToken.transfer(
                topListeners[1],
                listenerRewardsConfig.secondPlaceReward
            );
        }
        if (topListeners[2] != address(0)) {
            platformToken.transfer(
                topListeners[2],
                listenerRewardsConfig.thirdPlaceReward
            );
        }

        emit TopListenersRewarded(
            topListeners[0],
            topListeners[1],
            topListeners[2],
            listenerRewardsConfig.firstPlaceReward,
            listenerRewardsConfig.secondPlaceReward,
            listenerRewardsConfig.thirdPlaceReward
        );

        _resetMonthlyStreamCounts(currentMonthKey);
    }

    function _getCurrentMonthKey() internal view returns (uint256) {
        return block.timestamp / (30 days);
    }

    function _resetMonthlyStreamCounts(uint256 _monthKey) internal {
        // Use the tracked listener addresses to reset stream counts
        address[] storage listeners = monthlyListenerAddresses[_monthKey];

        for (uint256 j = 0; j < listeners.length; j++) {
            monthlyListenerStreamCounts[_monthKey][listeners[j]] = 0;
        }

        delete monthlyListenerAddresses[_monthKey];

        if (_monthKey > 12) {
            delete monthlyListenerAddresses[_monthKey - 12];
        }
    }

    function _findTopThreeListeners(
        uint256 _monthKey
    ) internal view returns (address[3] memory) {
        address[3] memory topListeners;
        uint256[3] memory topStreamCounts;

        // Use the tracked listener addresses
        address[] storage listeners = monthlyListenerAddresses[_monthKey];

        for (uint256 i = 0; i < listeners.length; i++) {
            address listener = listeners[i];
            uint256 streamCount = monthlyListenerStreamCounts[_monthKey][
                listener
            ];

            // Compare and update top 3
            for (uint256 j = 0; j < 3; j++) {
                if (streamCount > topStreamCounts[j]) {
                    // Shift existing top listeners
                    for (uint256 k = 2; k > j; k--) {
                        topListeners[k] = topListeners[k - 1];
                        topStreamCounts[k] = topStreamCounts[k - 1];
                    }

                    // Insert new top listener
                    topListeners[j] = listener;
                    topStreamCounts[j] = streamCount;
                    break;
                }
            }
        }

        return topListeners;
    }
}

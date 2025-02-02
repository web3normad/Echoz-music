// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../src/MusicNFT.sol";
import "../src/ThamaniStreamingPlatform.sol";
import "../src/PlatformToken.sol";

contract MusicPlatformTest is Test {
    Quiimo public platformToken;
    MusicNFT public musicNFT;
    ThamaniStreamingPlatform public streamingPlatform;

    // Test accounts
    address public artist1;
    address public artist2;
    address public investor1;
    address public investor2;
    address public listener1;
    address public platformOwner;

    // Setup function to initialize contracts and accounts
    function setUp() public {
        // Create test accounts
        platformOwner = makeAddr("platformOwner");
        artist1 = makeAddr("artist1");
        artist2 = makeAddr("artist2");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");
        listener1 = makeAddr("listener1");

        // Deploy platform token
        vm.prank(platformOwner);
    
vm.prank(platformOwner);
platformToken = new Quiimo(platformOwner);

        // Deploy music NFT with base URI
        vm.prank(platformOwner);
        musicNFT = new MusicNFT("https://example.com/metadata/");

        // Deploy streaming platform
        vm.prank(platformOwner);
        streamingPlatform = new ThamaniStreamingPlatform(
            address(musicNFT),
            address(platformToken)
        );
        

        // Prepare initial token balances and approvals
        vm.prank(platformOwner);
        platformToken.transfer(artist1, 100_000 * 10 ** 18);
        vm.prank(platformOwner);
        platformToken.transfer(artist2, 100_000 * 10 ** 18);
        vm.prank(platformOwner);
        platformToken.transfer(investor1, 50_000 * 10 ** 18);
        vm.prank(platformOwner);
        platformToken.transfer(listener1, 50_000 * 10 ** 18);
    }

    // MusicPlatformToken Tests
    function testTokenDeployment() public {
    assertEq(platformToken.name(), "Quiimo");
    assertEq(platformToken.symbol(), "QUI");
    assertEq(platformToken.totalSupply(), 20_000_000_000 * 10 ** 18);
}

    function testTokenMinting() public {
        uint256 initialSupply = platformToken.totalSupply();

        vm.prank(platformOwner);
        platformToken.mint(artist1, 10_000 * 10 ** 18);

        assertEq(platformToken.balanceOf(artist1), 110_000 * 10 ** 18);
        assertEq(
            platformToken.totalSupply(),
            initialSupply + 10_000 * 10 ** 18
        );
    }

    function testTokenBurning() public {
        uint256 initialBalance = platformToken.balanceOf(artist1);

        vm.prank(artist1);
        platformToken.burn(5_000 * 10 ** 18);

        assertEq(
            platformToken.balanceOf(artist1),
            initialBalance - 5_000 * 10 ** 18
        );
    }

    function testFailTokenMintByNonOwner() public {
        vm.prank(artist1);
        platformToken.mint(artist1, 10_000 * 10 ** 18); // Should revert
    }

    // MusicNFT Tests
function testCreateMusicRights() public {
    vm.startPrank(artist1);
    
    uint256 releaseId = musicNFT.createMusicRights(
        "First Track",
        "https://example.com/track1",
        1000,
        1 ether,
        true,
        10_000 ether
    );

    // Retrieve the MusicRights struct using getMusicRights
    MusicNFT.MusicRights memory rights = musicNFT.getMusicRights(releaseId);

    // Update assertions to use the struct directly
    assertEq(rights.artist, artist1);
    assertEq(rights.title, "First Track");
    assertEq(rights.totalShares, 1000);
    assertEq(rights.availableShares, 1000);
    assertEq(rights.sharePrice, 1 ether);
    assertTrue(rights.isFullRightsSale);
    assertEq(rights.fullRightsPrice, 10_000 ether);

    vm.stopPrank();
}

    function testPurchaseShares() public {
        // Create music rights
        vm.startPrank(artist1);
        uint256 releaseId = musicNFT.createMusicRights(
            "Shareable Track",
            "https://example.com/track2",
            1000,
            1 ether,
            false,
            0
        );
        vm.stopPrank();

        // Purchase shares
        vm.startPrank(investor1);

        // Make sure investor1 has enough ETH
        vm.deal(investor1, 1000 ether);

        // Approve and purchase shares
        musicNFT.purchaseShares{value: 500 ether}(releaseId, 500);

        // Assertions
        assertEq(musicNFT.balanceOf(investor1, releaseId), 500);
        assertEq(musicNFT.getInvestorShares(releaseId, investor1), 500);

        address[] memory investors = musicNFT.getInvestors(releaseId);
        assertEq(investors.length, 1);
        assertEq(investors[0], investor1);
        vm.stopPrank();
    }

  function testPurchaseFullRights() public {
    // Create music rights
    vm.startPrank(artist1);
    uint256 releaseId = musicNFT.createMusicRights(
        "Full Rights Track",
        "https://example.com/track3",
        1000,
        1 ether,
        true,
        10_000 ether
    );
    vm.stopPrank();

    // Purchase full rights
    vm.startPrank(investor1);
    vm.deal(investor1, 20_000 ether);
    musicNFT.purchaseFullRights{value: 10_000 ether}(releaseId);

    // Retrieve the MusicRights struct using getMusicRights
    MusicNFT.MusicRights memory rights = musicNFT.getMusicRights(releaseId);

    // Update assertions to use the struct directly
    assertEq(rights.artist, investor1);
    assertEq(rights.availableShares, 0);
    assertFalse(rights.isFullRightsSale);
    
    vm.stopPrank();
}

    // Streaming Platform Tests
    function testSubscriptionPurchase() public {
        vm.startPrank(listener1);
        platformToken.approve(address(streamingPlatform), 100 * 10 ** 18);

        streamingPlatform.purchaseSubscription(
            ThamaniStreamingPlatform.SubscriptionTier.Basic
        );

        // Correctly retrieve the entire Subscription struct
        (
            ThamaniStreamingPlatform.SubscriptionTier tier,
            uint256 startTimestamp,
            uint256 expiryTimestamp,
            bool isActive
        ) = streamingPlatform.userSubscriptions(listener1);

        assertEq(
            uint256(tier),
            uint256(ThamaniStreamingPlatform.SubscriptionTier.Basic)
        );
        assertTrue(isActive);
        assertGt(startTimestamp, 0);
        assertGt(expiryTimestamp, startTimestamp);
        vm.stopPrank();
    }

// function testStreamSongAndRevenueDistribution() public {
//     // Create and prepare song rights
//     vm.startPrank(artist1);
//     uint256 releaseId = musicNFT.createMusicRights(
//         "Streaming Track", 
//         "https://ipfs.io/ipfs/QmfJaLSzpoXcNxyVKUpVQV2WdWVkdUm4ySUJsjmp1YLFgy", 
//         1000, 
//         1 ether, 
//         false, 
//         0
//     );
//     streamingPlatform.setRevenueShareConfig(releaseId, 20, 60, 20);
//     vm.stopPrank();

//     // Purchase shares
//     vm.startPrank(investor1);
//     vm.deal(investor1, 1000 ether);
//     musicNFT.purchaseShares{value: 500 ether}(releaseId, 500);
//     vm.stopPrank();

//     // Ensure listener1 has enough platform tokens
//     vm.prank(platformOwner);
//     platformToken.transfer(listener1, 1000 * 10**18);

//     // Approve and purchase subscription
//     vm.startPrank(listener1);
//     platformToken.approve(address(streamingPlatform), 100 * 10**18);
//     streamingPlatform.purchaseSubscription(ThamaniStreamingPlatform.SubscriptionTier.Basic);
//     vm.stopPrank();

//     // Set up stream config if needed
//     vm.prank(platformOwner);
//     streamingPlatform.setMusicReleaseStreamConfig(
//         releaseId, 
//         5 * 10**17,  // base stream rate
//         20,          // subscription multiplier
//         10,          // quality multiplier
//         5            // location multiplier
//     );

//     // Stream song and distribute revenue
//     vm.startPrank(listener1);
//     streamingPlatform.streamSong(releaseId);
//     streamingPlatform.distributeStreamingRevenue(releaseId);
//     vm.stopPrank();

//     // Add assertions for revenue distribution here
// }



    // Negative Test Cases
    function testFailSubscriptionWithInsufficientTokens() public {
        // Create a new account with no tokens
        address poorListener = makeAddr("poorListener");

        vm.startPrank(poorListener);
        streamingPlatform.purchaseSubscription(
            ThamaniStreamingPlatform.SubscriptionTier.Basic
        );
        vm.stopPrank();
    }

    function testFailPurchaseSharesInsufficientFunds() public {
        // Create music rights
        vm.startPrank(artist1);
        uint256 releaseId = musicNFT.createMusicRights(
            "High Price Track",
            "https://example.com/track5",
            1000,
            10 ether,
            false,
            0
        );
        vm.stopPrank();

        // Attempt to purchase shares with insufficient funds
        vm.startPrank(investor1);
        vm.deal(investor1, 5 ether);
        musicNFT.purchaseShares{value: 5 ether}(releaseId, 500); // Should revert
        vm.stopPrank();
    }

    function testFailStreamWithExpiredSubscription() public {
        // Purchase subscription
        vm.startPrank(listener1);
        platformToken.approve(address(streamingPlatform), 100 * 10 ** 18);
        streamingPlatform.purchaseSubscription(
            ThamaniStreamingPlatform.SubscriptionTier.Basic
        );
        vm.stopPrank();

        // Simulate time passing
        vm.warp(block.timestamp + 31 days);

        // Try to stream song with expired subscription
        vm.startPrank(listener1);
        streamingPlatform.streamSong(1); // Should revert
        vm.stopPrank();
    }

  function testTopListenerRewardsDistribution() public {
    // Prepare multiple listeners with different streaming activities
    address listener2 = makeAddr("listener2");
    address listener3 = makeAddr("listener3");

    // Prepare platform tokens for listeners and subscription
    vm.prank(platformOwner);
    platformToken.transfer(listener1, 1000 * 10**18);
    vm.prank(platformOwner);
    platformToken.transfer(listener2, 1000 * 10**18);
    vm.prank(platformOwner);
    platformToken.transfer(listener3, 1000 * 10**18);

    // Create a music release
    vm.startPrank(artist1);
    uint256 releaseId = musicNFT.createMusicRights(
        "Top Listener Track", 
        "https://example.com/toplistener", 
        1000, 
        1 ether, 
        false, 
        0
    );
    
    
    streamingPlatform.setRevenueShareConfig(releaseId, 20, 60, 20);
    vm.stopPrank();

   
    vm.startPrank(listener1);
    platformToken.approve(address(streamingPlatform), 100 * 10**18);
    streamingPlatform.purchaseSubscription(ThamaniStreamingPlatform.SubscriptionTier.Basic);
    for (uint i = 0; i < 50; i++) {
        streamingPlatform.streamSong(releaseId);
    }
    vm.stopPrank();

    vm.startPrank(listener2);
    platformToken.approve(address(streamingPlatform), 100 * 10**18);
    streamingPlatform.purchaseSubscription(ThamaniStreamingPlatform.SubscriptionTier.Basic);
    for (uint i = 0; i < 30; i++) {
        streamingPlatform.streamSong(releaseId);
    }
    vm.stopPrank();

    vm.startPrank(listener3);
    platformToken.approve(address(streamingPlatform), 100 * 10**18);
    streamingPlatform.purchaseSubscription(ThamaniStreamingPlatform.SubscriptionTier.Basic);
    for (uint i = 0; i < 20; i++) {
        streamingPlatform.streamSong(releaseId);
    }
    vm.stopPrank();

  
    (
        uint256 firstPlaceReward, 
        uint256 secondPlaceReward, 
        uint256 thirdPlaceReward, 
        bool isEnabled
    ) = streamingPlatform.listenerRewardsConfig();

  
    uint256 listener1InitialBalance = platformToken.balanceOf(listener1);
    uint256 listener2InitialBalance = platformToken.balanceOf(listener2);
    uint256 listener3InitialBalance = platformToken.balanceOf(listener3);

 
    uint256 initialPlatformBalance = platformToken.balanceOf(address(streamingPlatform));
    assertGt(initialPlatformBalance, firstPlaceReward + secondPlaceReward + thirdPlaceReward);

 
    vm.prank(platformOwner);
    streamingPlatform.distributeTopListenerRewards();

   
    assertEq(
        platformToken.balanceOf(address(streamingPlatform)),
        initialPlatformBalance - (firstPlaceReward + secondPlaceReward + thirdPlaceReward),
        "Platform balance should decrease by total rewards distributed"
    );

  
    assertEq(platformToken.balanceOf(listener1), listener1InitialBalance + firstPlaceReward, "First place listener should receive first place reward");
    assertEq(platformToken.balanceOf(listener2), listener2InitialBalance + secondPlaceReward, "Second place listener should receive second place reward");
    assertEq(platformToken.balanceOf(listener3), listener3InitialBalance + thirdPlaceReward, "Third place listener should receive third place reward");
}

}

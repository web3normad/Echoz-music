import React, { useState, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import MusicPlatformABI from "../../ABI/MusicPlatform.json";
import ERC20_ABI from "../../ABI/MusicToken.json";

const MUSIC_STREAMING_CONTRACT_ADDRESS = "0x1548bBc64288241142B902c4D0B2D94912435D05";
const PLATFORM_TOKEN_ADDRESS = "0x9F2CEe162DaF4650eC224a4B9d00A4619F0c6301";

const SUBSCRIPTION_TIERS = {
  Free: 0,     
  Basic: 1,     
  Premium: 2,   
  Ultimate: 3   
};

const Subscription = () => {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, error, hash } = useWaitForTransactionReceipt();

  const { data: tokenBalance } = useReadContract({
    address: PLATFORM_TOKEN_ADDRESS, 
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: 957, // Explicitly specify Lisk Sepolia chain ID
  });

  // Add this to get the token decimals
const { data: tokenDecimals } = useReadContract({
  address: PLATFORM_TOKEN_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'decimals',
});

  
  const [activeSubscription, setActiveSubscription] = useState('Free');
  const [processingTier, setProcessingTier] = useState(null);

  const subscriptionTiers = [
    { name: 'Free', price: '0usdt', priceInEther: '0', features: ['100 Listening Minutes/Month', 'Limited Genre Access', 'Standard Audio Quality', 'No Offline Playback'] },
    { name: 'Basic', price: '50 tokens', priceInEther: '50', features: ['500 Listening Minutes/Month', 'Full Genre Access', 'High Audio Quality', 'Basic Offline Playback'] },
    { name: 'Premium', price: '100 tokens', priceInEther: '100', features: ['1500 Listening Minutes/Month', 'All Genre Access', 'Lossless Audio Quality', 'Unlimited Offline Playback', 'Exclusive Releases'] },
    { name: 'Ultimate', price: '150 tokens', priceInEther: '150', features: ['Unlimited Listening', 'Priority Content Curation', 'AI-Powered Recommendations', 'Collaborative Playlists', 'Artist Connect Sessions'] }
  ];

  const handlePurchaseSubscription = useCallback(async (tierName) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
  
    const tierIndex = SUBSCRIPTION_TIERS[tierName];
    const selectedTier = subscriptionTiers.find(tier => tier.name === tierName);
  
    if (!selectedTier) {
      alert('Invalid subscription tier');
      return;
    }
  
    try {
      setProcessingTier(tierName);
  
      // Use parseUnits with 18 decimals (standard for most tokens)
      const subscriptionCost = ethers.utils.parseUnits('5', 18);
  
      // Log more detailed debugging information
      console.log("Wallet Address:", address);
      console.log("Raw Token Balance:", tokenBalance);
      console.log("Subscription Cost (wei):", subscriptionCost.toString());
  
      // Ensure balance is converted to BigNumber
      const balance = ethers.BigNumber.from(tokenBalance || 0);
  
      console.log("Parsed Balance (wei):", balance.toString());
  
      if (balance.lt(subscriptionCost)) {
        alert('Insufficient token balance for this subscription.');
        setProcessingTier(null);
        return;
      }
  
      // Approve token spend
      const approvalTx = await writeContract({
        address: PLATFORM_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [MUSIC_STREAMING_CONTRACT_ADDRESS, subscriptionCost],
      });
  
      console.log("Approval Transaction Hash:", approvalTx);
  
      // Wait for approval confirmation using the hook
      const { isSuccess: isApprovalSuccess, error: approvalError } = await useWaitForTransactionReceipt({
        hash: approvalTx,
      });
  
      if (!isApprovalSuccess) {
        console.error("Approval Transaction Error:", approvalError);
        alert('Approval failed');
        setProcessingTier(null);
        return;
      }
  
      // Call purchaseSubscription
      const subscriptionTx = await writeContract({
        address: MUSIC_STREAMING_CONTRACT_ADDRESS,
        abi: MusicPlatformABI,
        functionName: 'purchaseSubscription',
        args: [tierIndex],
      });
  
      console.log("Subscription Transaction Hash:", subscriptionTx);
  
      // Wait for subscription transaction confirmation
      const { isSuccess: isSubscriptionSuccess, error: subscriptionError } = await useWaitForTransactionReceipt({
        hash: subscriptionTx,
      });
  
      if (!isSubscriptionSuccess) {
        console.error("Subscription Transaction Error:", subscriptionError);
        alert('Subscription transaction failed');
        setProcessingTier(null);
        return;
      }
  
      alert('Subscription purchased successfully!');
      setActiveSubscription(tierName);
    } catch (err) {
      console.error('Transaction Failed:', err);
      alert(err.message || 'Transaction failed. Please try again.');
    } finally {
      setProcessingTier(null);
    }
  }, [
    isConnected, 
    writeContract, 
    address, 
    tokenBalance
  ]);


  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col">
      <section className="p-6 bg-white dark:bg-[#252727] text-[#04e3cb] mx-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Current Subscription</h2>
          <p className="text-gray-500 dark:text-white">{activeSubscription} Plan</p>
        </div>
      </section>

      <section className="mt-8 px-6 grid grid-cols-4 gap-6">
        {subscriptionTiers.map((tier) => (
          <div 
            key={tier.name}
            className={`flex flex-col justify-between bg-white dark:bg-[#0F0F0F] dark:text-white border rounded-lg shadow-lg p-6
              ${activeSubscription === tier.name ? 'border-[#04e3cb]' : 'border-transparent hover:border-[#1bf3dc]'}
            `}
          >
            <h3 className="text-xl font-bold text-[#04e3cb]">{tier.name}</h3>
            <p className="text-3xl font-bold mb-4">{tier.price}</p>
            <ul className="mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <Check className="text-[#04e3cb] w-5 h-5 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button 
  onClick={() => handlePurchaseSubscription(tier.name)}
  disabled={processingTier === tier.name || activeSubscription === tier.name}
  className={`w-full py-3 rounded-lg font-bold
    ${activeSubscription === tier.name ? 'bg-[#04e3cb] text-white cursor-not-allowed' : 
      processingTier === tier.name ? 'bg-gray-300 text-gray-500' : 
      'bg-gray-200 hover:bg-gray-300 text-black'}
  `}
>
  {activeSubscription === tier.name ? 'Current Plan' : 
    (processingTier === tier.name ? 'Processing...' : 'Upgrade')}
</button>

          </div>
        ))}
      </section>
    </div>
  );
};

export default Subscription;

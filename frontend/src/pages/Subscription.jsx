import React, { useState } from 'react';
import { Check } from 'lucide-react';

const Subscription= () => {
  const [activeSubscription, setActiveSubscription] = useState('Free');

  const subscriptionTiers = [
    {
      name: 'Free',
      price: '0usdt',
      features: [
        '100 Listening Minutes/Month',
        'Limited Genre Access',
        'Standard Audio Quality',
        'No Offline Playback'
      ],
      buttonText: 'Current Plan'
    },
    {
      name: 'Basic',
      price: '$4.99usdt',
      features: [
        '500 Listening Minutes/Month',
        'Full Genre Access',
        'High Audio Quality',
        'Basic Offline Playback'
      ],
      buttonText: 'Upgrade'
    },
    {
      name: 'Premium',
      price: '9.99usdt',
      features: [
        '1500 Listening Minutes/Month',
        'All Genre Access',
        'Lossless Audio Quality',
        'Unlimited Offline Playback',
        'Exclusive Releases'
      ],
      buttonText: 'Upgrade'
    },
    {
      name: 'Ultimate',
      price: '14.99usdt',
      features: [
        'Unlimited Listening',
        'Priority Content Curation',
        'AI-Powered Recommendations',
        'Collaborative Playlists',
        'Artist Connect Sessions'
      ],
      buttonText: 'Upgrade'
    }
  ];

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col">
      {/* Current Subscription Status */}
      <section className="p-6 bg-white dark:bg-[#252727] text-[#04e3cb] mx-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Your Current Subscription</h2>
            <p className="text-gray-500 dark:text-white">
              {activeSubscription} Plan - {subscriptionTiers.find(tier => tier.name === activeSubscription).price}/month
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-white">
              Remaining Listening Minutes
            </p>
            <p className="text-2xl font-bold text-[#04e3cb]">
              {activeSubscription === 'Free' ? '100' : 
               activeSubscription === 'Basic' ? '500' : 
               activeSubscription === 'Premium' ? '1500' : 'Unlimited'}
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="mt-8 px-6 grid grid-cols-4 gap-6">
        {subscriptionTiers.map((tier) => (
          <div 
            key={tier.name}
            className={`
              flex flex-col justify-between 
              bg-white dark:bg-[#0F0F0F] dark:text-white
              border rounded-lg 
              shadow-lg 
              p-6 
              transform transition-all duration-300
              ${activeSubscription === tier.name 
                ? 'border-[#04e3cb] scale-105' 
                : 'border-transparent hover:border-[#1bf3dc]'}
            `}
          >
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#04e3cb]">{tier.name}</h3>
              <p className="text-3xl font-bold mb-6">{tier.price}</p>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="text-[#04e3cb] w-5 h-5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => setActiveSubscription(tier.name)}
              className={`
                w-full py-3 rounded-lg font-bold transition-colors
                ${activeSubscription === tier.name 
                  ? 'bg-[#04e3cb] text-white' 
                  : 'bg-gray-200 dark:bg-[#252727] text-gray-500 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1F1F1F]'}
              `}
            >
              {activeSubscription === tier.name ? 'Current Plan' : tier.buttonText}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Subscription;
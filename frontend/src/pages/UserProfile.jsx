import React, { useState } from 'react';
import { 
  FaUser, 
  FaCreditCard, 
  FaHistory, 
  FaTrophy, 
  FaCog,
  FaChevronRight
} from 'react-icons/fa';
import { 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const UserProfilePage = () => {
  const [activeSection, setActiveSection] = useState('subscription');
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('Basic');

  const userProfile = {
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@example.com',
    totalStreams: 5250000,
    totalRevenue: 262500,
    memberSince: 'January 2023'
  };

  const subscriptionTiers = [
    {
      name: 'Basic',
      price: 9.99,
      features: [
        'Standard audio quality',
        'Limited exclusive content',
        'Ad-supported',
        'Max 2 devices'
      ]
    },
    {
      name: 'Premium',
      price: 14.99,
      features: [
        'High-definition audio',
        'Full exclusive content access',
        'Ad-free listening',
        'Up to 5 devices',
        'Offline downloads'
      ]
    },
    {
      name: 'Ultimate',
      price: 19.99,
      features: [
        'Lossless audio quality',
        'All exclusive content',
        'Ad-free listening',
        'Unlimited devices',
        'Offline downloads',
        'Priority artist support'
      ]
    }
  ];

  const streamingHistory = [
    {
      date: '2024-01-15',
      track: 'Quantum Groove',
      artist: 'Cyber Rhythm',
      streams: 125000,
      revenue: 6250
    },
    {
      date: '2024-01-10',
      track: 'Urban Symphony',
      artist: 'Street Poets',
      streams: 175000,
      revenue: 8750
    },
    {
      date: '2024-01-05',
      track: 'Sunset Memories',
      artist: 'Luna Eclipse',
      streams: 100000,
      revenue: 5000
    }
  ];

  const renderSubscriptionSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#252727] dark:text-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#04e3cb]">Current Subscription</h2>
          <span className="px-3 py-1 bg-[#04e3cb] text-white rounded-full">
            {userSubscriptionTier}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {subscriptionTiers.map((tier) => (
            <div 
              key={tier.name}
              className={`
                border rounded-lg p-6 transition-all
                ${userSubscriptionTier === tier.name 
                  ? 'border-[#04e3cb] bg-[#04e3cb]/10' 
                  : 'border-gray-200 dark:border-[#0F0F0F] hover:border-[#04e3cb]/50'}
              `}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{tier.name}</h3>
                {userSubscriptionTier === tier.name && (
                  <span className="text-[#04e3cb]">✓</span>
                )}
              </div>
              <p className="text-2xl font-bold mb-4">${tier.price}/month</p>
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <span className="text-[#04e3cb]">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {userSubscriptionTier !== tier.name && (
                <button className="w-full py-2 bg-[#04e3cb] text-white rounded-lg hover:bg-[#03b5a7]">
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStreamingHistorySection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#04e3cb]">Streaming History</h2>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
            <ChevronUp size={20} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
      <div className="divide-y dark:divide-[#0F0F0F]">
        {streamingHistory.map((entry) => (
          <div key={entry.date} className="py-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#04e3cb]">{entry.track}</h3>
              <p className="text-sm text-gray-500 dark:text-white">{entry.artist}</p>
              <p className="text-xs text-gray-400">{entry.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{entry.streams.toLocaleString()} Streams</p>
              <p className="text-sm text-[#04e3cb]">${entry.revenue.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccountSettingsSection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-[#04e3cb] mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Full Name</label>
          <input 
            type="text" 
            defaultValue={userProfile.name}
            className="w-full px-3 py-2 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email Address</label>
          <input 
            type="email" 
            defaultValue={userProfile.email}
            className="w-full px-3 py-2 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Password</label>
          <input 
            type="password" 
            defaultValue="********"
            className="w-full px-3 py-2 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
        </div>
        
        <button className="w-full py-2 bg-[#04e3cb] text-white rounded-lg hover:bg-[#03b5a7]">
          Save Changes
        </button>
      </div>
    </div>
  );

  const sectionMenuItems = [
    { 
      icon: <FaCreditCard />, 
      label: 'Subscription', 
      section: 'subscription' 
    },
    { 
      icon: <FaHistory />, 
      label: 'Streaming History', 
      section: 'history' 
    },
    { 
      icon: <FaCog />, 
      label: 'Account Settings', 
      section: 'settings' 
    }
  ];

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col bg-gray-100 dark:bg-[#1A1A1A]">
      {/* Header Section */}
      <section className="px-6 mb-6">
        <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-[#04e3cb]/20 rounded-full flex items-center justify-center">
              <FaUser className="text-[#04e3cb] text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#04e3cb]">{userProfile.name}</h1>
              <p className="text-gray-500 dark:text-white">Member since {userProfile.memberSince}</p>
              <div className="mt-2 flex space-x-4">
                <div>
                  <p className="text-sm text-gray-500">Total Streams</p>
                  <p className="font-bold text-[#04e3cb]">{userProfile.totalStreams.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="font-bold text-[#04e3cb]">${userProfile.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-6 flex-1 flex space-x-6 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-1/4 bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
          <nav className="space-y-2">
            {sectionMenuItems.map((item) => (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg transition-all
                  ${activeSection === item.section 
                    ? 'bg-[#04e3cb] text-white' 
                    : 'bg-gray-200 dark:bg-[#0F0F0F] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1F1F1F]'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <FaChevronRight />
              </button>
            ))}
          </nav>
        </div>

        {/* Dynamic Content Section */}
        <div className="w-3/4 overflow-y-auto">
          {activeSection === 'subscription' && renderSubscriptionSection()}
          {activeSection === 'history' && renderStreamingHistorySection()}
          {activeSection === 'settings' && renderAccountSettingsSection()}
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;
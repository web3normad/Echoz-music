import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Info 
} from 'lucide-react';

const RevenueSharePage = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [revenueShares, setRevenueShares] = useState({
    platform: 30,
    artist: 50,
    investors: 20
  });

  const musicReleases = [
    {
      id: 1,
      title: 'Sunset Memories',
      artist: 'Luna Eclipse',
      totalRevenue: 62500,
      platformShare: 18750,
      artistShare: 31250,
      investorShare: 12500
    },
    {
      id: 2,
      title: 'Quantum Groove',
      artist: 'Cyber Rhythm',
      totalRevenue: 43750,
      platformShare: 13125,
      artistShare: 21875,
      investorShare: 8750
    },
    {
      id: 3,
      title: 'Urban Symphony',
      artist: 'Street Poets',
      totalRevenue: 75000,
      platformShare: 22500,
      artistShare: 37500,
      investorShare: 15000
    },
    {
      id: 4,
      title: 'Whispers of Time',
      artist: 'Acoustic Realm',
      totalRevenue: 22500,
      platformShare: 6750,
      artistShare: 11250,
      investorShare: 4500
    }
  ];

  const tabs = ['Overview', 'Revenue Settings', 'Detailed Breakdown'];

  const handleShareUpdate = (stakeholder, newValue) => {
    const updatedShares = { ...revenueShares };
    updatedShares[stakeholder] = newValue;

    // Ensure total always equals 100%
    const total = updatedShares.platform + updatedShares.artist + updatedShares.investors;
    if (total === 100) {
      setRevenueShares(updatedShares);
    }
  };

  const totalRevenueStats = musicReleases.reduce((acc, release) => ({
    totalRevenue: acc.totalRevenue + release.totalRevenue,
    platformShare: acc.platformShare + release.platformShare,
    artistShare: acc.artistShare + release.artistShare,
    investorShare: acc.investorShare + release.investorShare
  }), { totalRevenue: 0, platformShare: 0, artistShare: 0, investorShare: 0 });

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <section className="px-6 mb-6">
        <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg transition-all
                    ${activeTab === tab 
                      ? 'bg-[#04e3cb] text-white' 
                      : 'bg-gray-200 dark:bg-[#0F0F0F] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#1F1F1F]'}
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
                <ChevronLeft size={20} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-[#0F0F0F] rounded-full text-gray-500 hover:bg-gray-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 flex-1 overflow-y-auto">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Revenue Overview */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#04e3cb] mb-4">Total Revenue Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Total Revenue</span>
                  <span className="font-bold text-[#04e3cb]">
                    ${totalRevenueStats.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Platform Share</span>
                  <span className='dark:text-white'>${totalRevenueStats.platformShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Artist Share</span>
                  <span className="text-green-500">
                    ${totalRevenueStats.artistShare.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Investor Share</span>
                  <span className='dark:text-white'>${totalRevenueStats.investorShare.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Revenue Distribution Pie Chart */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#04e3cb] mb-4">Revenue Distribution</h2>
              <div className="flex items-center justify-center space-x-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#04e3cb] to-blue-500 relative">
                  <div className="absolute inset-4 bg-white dark:bg-[#252727] rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#04e3cb]">
                        {revenueShares.platform}%
                      </p>
                      <p className="text-xs text-gray-500">Platform</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#04e3cb] rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-white">
                      Artist: {revenueShares.artist}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-white">
                      Platform: {revenueShares.platform}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-white">
                      Investors: {revenueShares.investors}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Revenue Settings' && (
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-[#04e3cb] mb-4">Revenue Share Configuration</h2>
            <div className="space-y-4">
              {Object.keys(revenueShares).map((stakeholder) => (
                <div key={stakeholder} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-white capitalize">
                      {stakeholder} Share
                    </span>
                    <div 
                      title="Revenue share percentage can be adjusted to ensure fair distribution"
                      className="cursor-help"
                    >
                      <Info size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number"
                      value={revenueShares[stakeholder]}
                      onChange={(e) => handleShareUpdate(stakeholder, Number(e.target.value))}
                      min="0"
                      max="100"
                      className="
                        w-20 p-2 border rounded 
                        bg-gray-100 dark:bg-[#0F0F0F] dark:text-white
                        text-right
                      "
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>Total:</span>
                <span 
                  className={`
                    font-bold 
                    ${Object.values(revenueShares).reduce((a, b) => a + b, 0) === 100 
                      ? 'text-green-500' 
                      : 'text-red-500'}
                  `}
                >
                  {Object.values(revenueShares).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Detailed Breakdown' && (
          <div className="space-y-6">
            {musicReleases.map((release) => (
              <div 
                key={release.id}
                className="
                  flex items-center justify-between 
                  bg-white dark:bg-[#252727] 
                  rounded-lg shadow-lg p-6
                  hover:shadow-xl transition-all
                "
              >
                <div className="w-1/3">
                  <h3 className="font-bold text-[#04e3cb]">{release.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white">{release.artist}</p>
                </div>

                <div className="w-1/3 text-center">
                  <p className="text-xl font-bold text-[#04e3cb]">
                    ${release.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>

                <div className="w-1/3 flex justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Platform: ${release.platformShare.toLocaleString()}</p>
                    <p className="text-sm text-green-500">Artist: ${release.artistShare.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Investors: ${release.investorShare.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RevenueSharePage;
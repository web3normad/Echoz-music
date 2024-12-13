import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  PieChart,
  DollarSign,
  Briefcase
} from 'lucide-react';

const InvestorDashboard = () => {
  const [activeTab, setActiveTab] = useState('Portfolio Overview');
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const investmentPortfolio = [
    {
      id: 1,
      title: 'Sunset Memories',
      artist: 'Luna Eclipse',
      totalInvestment: 250000,
      sharePercentage: 15,
      currentValue: 275000,
      totalRevenue: 62500,
      investorRevenue: 9375,
      genre: 'Pop',
      investmentDate: '2023-03-15',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Quantum Groove',
      artist: 'Cyber Rhythm',
      totalInvestment: 180000,
      sharePercentage: 10,
      currentValue: 198000,
      totalRevenue: 43750,
      investorRevenue: 4375,
      genre: 'Electronic',
      investmentDate: '2023-06-22',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Urban Symphony',
      artist: 'Street Poets',
      totalInvestment: 350000,
      sharePercentage: 20,
      currentValue: 385000,
      totalRevenue: 75000,
      investorRevenue: 15000,
      genre: 'Hip Hop',
      investmentDate: '2023-01-10',
      status: 'Active'
    }
  ];

  const tabs = [
    'Portfolio Overview', 
    'Investment Details', 
    'Performance Insights'
  ];

  const calculatePortfolioStats = () => {
    return investmentPortfolio.reduce((acc, investment) => ({
      totalInvested: acc.totalInvested + investment.totalInvestment,
      currentPortfolioValue: acc.currentPortfolioValue + investment.currentValue,
      totalRevenue: acc.totalRevenue + investment.investorRevenue
    }), { totalInvested: 0, currentPortfolioValue: 0, totalRevenue: 0 });
  };

  const portfolioStats = calculatePortfolioStats();

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
        {activeTab === 'Portfolio Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Investment Card */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 flex items-center space-x-4">
              <div className="bg-[#04e3cb]/20 p-3 rounded-full">
                <DollarSign className="text-[#04e3cb]" size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-white">Total Invested</p>
                <h3 className="text-2xl font-bold text-[#04e3cb]">
                  ${portfolioStats.totalInvested.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Portfolio Value Card */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 flex items-center space-x-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-white">Current Portfolio Value</p>
                <h3 className="text-2xl font-bold text-green-500">
                  ${portfolioStats.currentPortfolioValue.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 flex items-center space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-full">
                <PieChart className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-white">Total Investor Revenue</p>
                <h3 className="text-2xl font-bold text-purple-500">
                  ${portfolioStats.totalRevenue.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Investment Details' && (
          <div className="space-y-6">
            {investmentPortfolio.map((investment) => (
              <div 
                key={investment.id}
                className="
                  flex items-center justify-between 
                  bg-white dark:bg-[#252727] 
                  rounded-lg shadow-lg p-6
                  hover:shadow-xl transition-all
                  cursor-pointer
                "
                onClick={() => setSelectedInvestment(investment)}
              >
                <div className="w-1/3">
                  <h3 className="font-bold text-[#04e3cb]">{investment.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white">{investment.artist}</p>
                </div>

                <div className="w-1/3 text-center">
                  <p className="text-sm text-gray-500">Investment</p>
                  <p className="text-xl font-bold text-[#04e3cb]">
                    ${investment.totalInvestment.toLocaleString()}
                  </p>
                </div>

                <div className="w-1/3 flex justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Share: {investment.sharePercentage}%
                    </p>
                    <p className="text-sm text-green-500">
                      Revenue: ${investment.investorRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Genre: {investment.genre}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Performance Insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investment Performance Overview */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#04e3cb] mb-4 flex items-center">
                <Briefcase className="mr-2" size={20} /> Performance Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Total Investments</span>
                  <span className="font-bold">{investmentPortfolio.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Average Share Percentage</span>
                  <span className="text-[#04e3cb]">
                    {(investmentPortfolio.reduce((sum, inv) => sum + inv.sharePercentage, 0) / investmentPortfolio.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Total Portfolio Gain</span>
                  <span className="text-green-500">
                    ${(portfolioStats.currentPortfolioValue - portfolioStats.totalInvested).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-white">Portfolio ROI</span>
                  <span className="text-[#04e3cb]">
                    {(((portfolioStats.currentPortfolioValue - portfolioStats.totalInvested) / portfolioStats.totalInvested) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Investment Distribution */}
            <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#04e3cb] mb-4">Investment Distribution</h2>
              <div className="flex items-center justify-center space-x-6">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-[#04e3cb] to-purple-500 relative">
                  <div className="absolute inset-4 bg-white dark:bg-[#252727] rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#04e3cb]">
                        {investmentPortfolio.reduce((sum, inv) => sum + inv.sharePercentage, 0)}%
                      </p>
                      <p className="text-xs text-gray-500">Total Share</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {investmentPortfolio.map((investment) => (
                    <div key={investment.id} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{
                          backgroundColor: investment.genre === 'Pop' ? '#04e3cb' :
                                           investment.genre === 'Electronic' ? '#6b46c1' :
                                           '#10b981'
                        }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-white">
                        {investment.title}: {investment.sharePercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Investment Details Modal (Optional) */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-2xl p-8 w-96">
            <h2 className="text-xl font-bold text-[#04e3cb] mb-4">
              {selectedInvestment.title}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Artist</span>
                <span className="font-bold">{selectedInvestment.artist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Investment Date</span>
                <span>{selectedInvestment.investmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Total Investment</span>
                <span className="text-[#04e3cb]">
                  ${selectedInvestment.totalInvestment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Share Percentage</span>
                <span>{selectedInvestment.sharePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Current Value</span>
                <span className="text-green-500">
                  ${selectedInvestment.currentValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Total Revenue</span>
                <span>${selectedInvestment.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-white">Investor Revenue</span>
                <span className="text-purple-500">
                  ${selectedInvestment.investorRevenue.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvestment(null)}
                className="mt-4 w-full bg-[#04e3cb] text-white py-2 rounded-lg hover:bg-[#03b3a6] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDashboard;
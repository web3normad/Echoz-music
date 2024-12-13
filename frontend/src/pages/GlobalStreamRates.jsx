import React, { useState } from 'react';
import { 
  FaMoneyBillWave, 
  FaCog, 
  FaMap, 
  FaChartLine,
  FaPlus,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const GlobalStreamRates = () => {
  const [activeSection, setActiveSection] = useState('baseRates');
  const [baseStreamRate, setBaseStreamRate] = useState(0.0005);
  const [subscriptionMultipliers, setSubscriptionMultipliers] = useState({
    Free: 0.7,
    Basic: 1.0,
    Premium: 1.3,
    Ultimate: 1.5
  });

  const [qualityMultipliers, setQualityMultipliers] = useState({
    Standard: 1.0,
    High: 1.2,
    Lossless: 1.5
  });

  const [locationMultipliers, setLocationMultipliers] = useState([
    { country: 'United States', multiplier: 1.2 },
    { country: 'Canada', multiplier: 1.1 },
    { country: 'United Kingdom', multiplier: 1.15 }
  ]);

  const [newLocation, setNewLocation] = useState({ country: '', multiplier: 1.0 });

  const addLocationMultiplier = () => {
    if (newLocation.country && newLocation.multiplier) {
      setLocationMultipliers([...locationMultipliers, { ...newLocation }]);
      setNewLocation({ country: '', multiplier: 1.0 });
    }
  };

  const removeLocationMultiplier = (countryToRemove) => {
    setLocationMultipliers(
      locationMultipliers.filter(location => location.country !== countryToRemove)
    );
  };

  const renderBaseRatesSection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#04e3cb]">Base Stream Rate Configuration</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Current Rate:</span>
          <input 
            type="number" 
            step="0.0001"
            value={baseStreamRate}
            onChange={(e) => setBaseStreamRate(parseFloat(e.target.value))}
            className="w-24 px-2 py-1 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
          <span className="text-sm text-gray-500">$/stream</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4 text-[#04e3cb]">Estimated Annual Impact</h3>
          <div className="bg-[#04e3cb]/10 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Total Annual Streams</span>
              <span className="font-bold">5,250,000</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Potential Annual Payout</span>
              <span className="font-bold text-[#04e3cb]">$2,625</span>
            </div>
            <div className="flex justify-between">
              <span>Change from Previous Rate</span>
              <span className="text-green-500">+5.2%</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-[#04e3cb]">Rate Calculation Breakdown</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Base Stream Rate</span>
              <span>${baseStreamRate.toFixed(4)}</span>
            </li>
            <li className="flex justify-between">
              <span>Monthly Adjustment Factor</span>
              <span>1.05</span>
            </li>
            <li className="flex justify-between">
              <span>Projected Trend</span>
              <span className="text-green-500">↑ Increasing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionMultipliersSection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-[#04e3cb]">Subscription Tier Multipliers</h2>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(subscriptionMultipliers).map(([tier, multiplier]) => (
          <div 
            key={tier} 
            className="bg-gray-100 dark:bg-[#0F0F0F] p-4 rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{tier} Tier</span>
              <input 
                type="number" 
                step="0.1"
                value={multiplier}
                onChange={(e) => setSubscriptionMultipliers({
                  ...subscriptionMultipliers,
                  [tier]: parseFloat(e.target.value)
                })}
                className="w-16 px-2 py-1 border rounded-lg dark:bg-[#1A1A1A] dark:border-[#252727] text-right"
              />
            </div>
            <div className="text-sm text-gray-500">
              Payout Multiplier: {multiplier}x
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQualityMultipliersSection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-[#04e3cb]">Audio Quality Multipliers</h2>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(qualityMultipliers).map(([quality, multiplier]) => (
          <div 
            key={quality} 
            className="bg-gray-100 dark:bg-[#0F0F0F] p-4 rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{quality}</span>
              <input 
                type="number" 
                step="0.1"
                value={multiplier}
                onChange={(e) => setQualityMultipliers({
                  ...qualityMultipliers,
                  [quality]: parseFloat(e.target.value)
                })}
                className="w-16 px-2 py-1 border rounded-lg dark:bg-[#1A1A1A] dark:border-[#252727] text-right"
              />
            </div>
            <div className="text-sm text-gray-500">
              Payout Multiplier: {multiplier}x
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLocationMultipliersSection = () => (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#04e3cb]">Location-Based Multipliers</h2>
        <div className="flex items-center space-x-2">
          <input 
            type="text"
            placeholder="Country"
            value={newLocation.country}
            onChange={(e) => setNewLocation({...newLocation, country: e.target.value})}
            className="w-32 px-2 py-1 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
          <input 
            type="number"
            step="0.1"
            placeholder="Multiplier"
            value={newLocation.multiplier}
            onChange={(e) => setNewLocation({...newLocation, multiplier: parseFloat(e.target.value)})}
            className="w-24 px-2 py-1 border rounded-lg dark:bg-[#0F0F0F] dark:border-[#252727]"
          />
          <button 
            onClick={addLocationMultiplier}
            className="p-2 bg-[#04e3cb] text-white rounded-lg hover:bg-[#03b5a7]"
          >
            <FaPlus />
          </button>
        </div>
      </div>
      
      <div className="divide-y dark:divide-[#0F0F0F]">
        {locationMultipliers.map((location) => (
          <div 
            key={location.country} 
            className="flex justify-between items-center py-3"
          >
            <div>
              <span className="font-semibold">{location.country}</span>
              <span className="ml-4 text-sm text-gray-500">
                Payout Multiplier: {location.multiplier}x
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => removeLocationMultiplier(location.country)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const sectionMenuItems = [
    { 
      icon: <FaMoneyBillWave />, 
      label: 'Base Rates', 
      section: 'baseRates' 
    },
    { 
      icon: <FaCog />, 
      label: 'Subscription Multipliers', 
      section: 'subscriptionMultipliers' 
    },
    { 
      icon: <FaChartLine />, 
      label: 'Quality Multipliers', 
      section: 'qualityMultipliers' 
    },
    { 
      icon: <FaMap />, 
      label: 'Location Multipliers', 
      section: 'locationMultipliers' 
    }
  ];

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col bg-gray-100 dark:bg-[#1A1A1A] dark:text-white">
      {/* Header Section */}
      <section className="px-6 mb-6">
        <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-[#04e3cb]/20 rounded-full flex items-center justify-center">
              {/* <FaGlobal className="text-[#04e3cb] text-4xl" /> */}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#04e3cb]">Global Stream Economics</h1>
              <p className="text-gray-500 dark:text-white">Platform-wide Streaming Rate Configuration</p>
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
              </button>
            ))}
          </nav>
        </div>

        {/* Dynamic Content Section */}
        <div className="w-3/4 overflow-y-auto space-y-6">
          {activeSection === 'baseRates' && renderBaseRatesSection()}
          {activeSection === 'subscriptionMultipliers' && renderSubscriptionMultipliersSection()}
          {activeSection === 'qualityMultipliers' && renderQualityMultipliersSection()}
          {activeSection === 'locationMultipliers' && renderLocationMultipliersSection()}
          
          {/* Save Changes Button */}
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
            <button className="w-full py-2 bg-[#04e3cb] text-white rounded-lg hover:bg-[#03b5a7]">
              Save Global Stream Rate Configuration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GlobalStreamRates;
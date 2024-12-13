import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  DollarSignIcon,
  AudioLines,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


const MusicArtistDashboard = () => {
  const [musicReleases, setMusicReleases] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [streamCounts, setStreamCounts] = useState([]);
 
  // Mock data fetch
  useEffect(() => {
    const fetchArtistData = async () => {
      setMusicReleases([
        {
          id: 1,
          title: 'Summer Vibes',
          artist: 'Ben Hector',
          totalStreams: 5000,
          monthlyRevenue: 1250,
          image: '/summer-vibes.jpg',
        },
        {
          id: 2,
          title: 'Night Rhythm',
          artist: 'Em Beihold',
          totalStreams: 3500,
          monthlyRevenue: 875,
          image: '/night-rhythm.jpg',
        },
      ]);
      setTotalRevenue(2125);
      setStreamCounts([
        { name: 'Summer Vibes', streams: 5000 },
        { name: 'Night Rhythm', streams: 3500 },
      ]);
    };
    fetchArtistData();
  }, []);

  return (
    <div className="h-screen w-full pt-5 overflow-hidden flex flex-col">
      <div className="flex flex-col space-y-8 px-6 pb-10">
        {/* First Row: Stats */}
        <section className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Total Revenue</span>
              <DollarSignIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#04e3cb]">${totalRevenue}</div>
          </div>
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Total Streams</span>
              <AudioLines className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#04e3cb]">8,500</div>
          </div>
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Investors</span>
              <UsersIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-[#04e3cb]">5</div>
          </div>
          <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Revenue Share</span>
              <TrendingUpIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-sm text-[#04e3cb]">
              <div>Platform: 20%</div>
              <div>Artist: 50%</div>
              <div>Investors: 30%</div>
            </div>
          </div>
        </section>

        {/* Second Row: Streaming Analytics */}
        <section className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#04e3cb] mb-4">Streaming Analytics</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={streamCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="name" tick={{ fill: '#04e3cb' }} />
              <YAxis tick={{ fill: '#04e3cb' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F0F0F',
                  borderColor: '#04e3cb',
                  color: '#04e3cb',
                }}
              />
              <Bar dataKey="streams" fill="#04e3cb" />
            </BarChart>
          </ResponsiveContainer>
        </section>

      </div>
    </div>
  );
};

export default MusicArtistDashboard;
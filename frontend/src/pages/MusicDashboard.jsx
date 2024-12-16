import React, { useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useContractRead} from "wagmi";
import StreamingPlatformABI from "../../ABI/MusicPlatform.json";

// Replace with your contract address
const STREAMING_PLATFORM_ADDRESS = "0xbb9Ae81c1A4d3Dac663593B798Fd3e2aF38AEb87";

const MusicStreamPage = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Contract setup with Wagmi
  const { data: streamRateConfig, isLoading: isConfigLoading } = useContractRead({
    address: STREAMING_PLATFORM_ADDRESS,
    abi: StreamingPlatformABI,
    functionName: "globalStreamRateConfig",
  });

  const topCharts = [
    { id: 1, title: "AI Music Genre", artist: "Various Artists", image: "/ai-music.jpg" },
    { id: 2, title: "Pop", artist: "Various Artists", image: "/pop.jpg" },
    { id: 3, title: "Hip Hop", artist: "Various Artists", image: "/hiphop.jpg" },
    { id: 4, title: "Rock", artist: "Various Artists", image: "/rock.jpg" },
    { id: 5, title: "R&B Soul", artist: "Various Artists", image: "/rnb.jpg" },
    { id: 6, title: "Country", artist: "Various Artists", image: "/country.jpg" },
  ];

  const listeningHistory = [
    { id: 1, title: "She Will Be Loved", artist: "Maroon 5", streams: "120k" },
    { id: 2, title: "Dumb Little Bug", artist: "Em Beihold", streams: "110k" },
    { id: 3, title: "It Would Be You", artist: "Ben Hector", streams: "98k" },
  ];

  const handlePlayPause = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-[#252727] min-h-screen text-gray-800 dark:text-white p-6">
      {/* Top Charts Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top 50</h2>
        <Swiper spaceBetween={16} slidesPerView="auto" className="overflow-x-auto scrollbar-hide">
          {topCharts.map((chart) => (
            <SwiperSlide key={chart.id} className="w-[180px]">
              <div className="rounded-2xl overflow-hidden">
                <img src={chart.image} alt={chart.title} className="w-full h-32 object-cover" />
                <div className="bg-white dark:bg-[#333] p-4">
                  <h3 className="font-semibold text-sm">{chart.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300">{chart.artist}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Listening History */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Listening History</h2>
        <div className="bg-white dark:bg-[#333] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 p-4 font-bold text-gray-600 dark:text-gray-300 border-b">
            <div>Title</div>
            <div>Artist</div>
            <div>Streams</div>
          </div>
          {listeningHistory.map((track) => (
            <div
              key={track.id}
              className="grid grid-cols-3 items-center p-4 border-t hover:bg-gray-100 dark:hover:bg-[#444]"
            >
              <div>{track.title}</div>
              <div>{track.artist}</div>
              <div className="flex items-center justify-between">
                <span>{track.streams}</span>
                <button
                  onClick={() => handlePlayPause(track)}
                  className="text-[#04e3cb] hover:text-[#02b39c]"
                >
                  {currentTrack?.id === track.id && isPlaying ? <FaPause /> : <FaPlay />}
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </section>

      {/* Now Playing */}
      {currentTrack && (
        <section className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#333] p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={currentTrack.image || "/default-cover.jpg"}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-bold">{currentTrack.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[#04e3cb] hover:text-[#02b39c]"
              >
                {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
              </button>
              <BsThreeDots size={20} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MusicStreamPage;

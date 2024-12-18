import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  DynamicContextProvider,
  DynamicWidget,
  mergeNetworks
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

// Import Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Theme Provider
import { ThemeProvider } from './context/ThemeContext';

// Import Pages
import MusicDashboard from "./pages/MusicDashboard";
import Search from "./pages/Search";
import Likes from "./pages/Likes";
import Playlists from "./pages/Playlist";
import Albums from "./pages/Albums";
import Following from "./pages/Following";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Logout from "./pages/Logout";
import UploadMusic from "./pages/UploadMusic";
import Revenue from "./pages/Revenue";
import InvestorDashboard from "./pages/InvestorDashboard";
import UserProfile from "./pages/UserProfile";
import GlobalStreamRates from "./pages/GlobalStreamRates";
import Artist from "./pages/Artist/Artist";
import ExplorePage from "./pages/ExploreMusic";

// Define Lisk Sepolia Network
const liskSepoliaNetwork = {
  blockExplorerUrls: ['https://sepolia-explorer.lisk.com/'],
  chainId: 4202,
  chainName: 'Lisk Sepolia Testnet',
  iconUrls: [], 
  name: 'Lisk Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia ETH',
    symbol: 'ETH',
    iconUrl: '', // Optional icon URL for the currency
  },
  networkId: 4202,
  rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
  vanityName: 'Lisk Sepolia',
};

// Query Client and Wagmi Config
const queryClient = new QueryClient();
const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [4202]: http('https://rpc.sepolia-api.lisk.com'), 
  },
});

export default function App() {
  return (
    <DynamicContextProvider
    settings={{
      environmentId: "417088c0-4493-4724-8927-ba502b6daf5d",
      walletConnectors: [EthereumWalletConnectors],
      overrides: {
        // Option 1: Complete override
        // evmNetworks: [liskSepoliaNetwork]
        
        // Option 2: Merge with existing networks
        evmNetworks: (networks) => mergeNetworks([liskSepoliaNetwork], networks)
      },
    }}
  >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
          <ThemeProvider>
            <Router>
              <div className="flex dark:bg-[#131316] bg-[#fafafa]">
                <Sidebar />
                <div className="w-full dark:bg-[#131316] z-10">
                  <Navbar />
                  <main className="p-4 bg-gray-50 dark:bg-[#0F0F0F] overflow-y-hidden">
                    <Routes>
                      <Route path="/" element={<MusicDashboard />} />
                      <Route path="/stream-music" element={<MusicDashboard />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/likes" element={<Likes />} />
                      <Route path="/playlists" element={<Playlists />} />
                      <Route path="/albums" element={<Albums />} />
                      <Route path="/following" element={<Following />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/upload-music" element={<UploadMusic />} />
                      <Route path="/revenue" element={<Revenue />} />
                      <Route path="/investor" element={<InvestorDashboard />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route
                        path="/global-stream"
                        element={<GlobalStreamRates />}
                      />
                      <Route path="/explore-music" element={<ExplorePage />} />
                      <Route path="/artist" element={<Artist />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </Router>
            </ThemeProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
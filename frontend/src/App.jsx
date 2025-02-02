import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  DynamicContextProvider,
  DynamicWidget,
  mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

// Import Components
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./context/ThemeContext";

// Import Pages
import LandingPage from "./pages/LandingPage";
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
  blockExplorerUrls: ["https://sepolia-explorer.lisk.com/"],
  chainId: 4202,
  chainName: "Lisk Sepolia Testnet",
  iconUrls: [],
  name: "Lisk Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia ETH",
    symbol: "ETH",
    iconUrl: "",
  },
  networkId: 4202,
  rpcUrls: ["https://rpc.sepolia-api.lisk.com"],
  vanityName: "Lisk Sepolia",
};

const queryClient = new QueryClient();
const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [4202]: http("https://rpc.sepolia-api.lisk.com"),
  },
});

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => mergeNetworks([liskSepoliaNetwork], networks),
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <ThemeProvider>
              <Router>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Dashboard Pages with Sidebar and Navbar */}
                  <Route
                    path="/stream-music"
                    element={
                      <DashboardLayout>
                        <MusicDashboard />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <DashboardLayout>
                        <Search />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/likes"
                    element={
                      <DashboardLayout>
                        <Likes />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/playlists"
                    element={
                      <DashboardLayout>
                        <Playlists />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/albums"
                    element={
                      <DashboardLayout>
                        <Albums />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/following"
                    element={
                      <DashboardLayout>
                        <Following />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/subscription"
                    element={
                      <DashboardLayout>
                        <Subscription />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/logout"
                    element={
                      <DashboardLayout>
                        <Logout />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/upload-music"
                    element={
                      <DashboardLayout>
                        <UploadMusic />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/revenue"
                    element={
                      <DashboardLayout>
                        <Revenue />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/investor"
                    element={
                      <DashboardLayout>
                        <InvestorDashboard />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <DashboardLayout>
                        <UserProfile />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/global-stream"
                    element={
                      <DashboardLayout>
                        <GlobalStreamRates />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/explore-music"
                    element={
                      <DashboardLayout>
                        <ExplorePage />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/artist"
                    element={
                      <DashboardLayout>
                        <Artist />
                      </DashboardLayout>
                    }
                  />
                </Routes>
              </Router>
            </ThemeProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

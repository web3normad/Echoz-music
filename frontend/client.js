import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb";

export const liskSepolia = defineChain({
  id: 4202,
  name: "Lisk Sepolia Testnet",
  rpc: ["https://rpc.sepolia-api.lisk.com"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Lisk Sepolia Explorer",
      url: "https://sepolia-blockscout.lisk.com",
      apiUrl: "https://sepolia-blockscout.lisk.com/api",
    },
  ],
  testnet: true,
});

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  supportedChains: [liskSepolia],
});

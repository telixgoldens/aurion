import { http, createConfig } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

// 1. Define the chains you want to support
// Aurion is an Arbitrum-first protocol, so we prioritize these.
export const config = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  
  // 2. Define how the app connects to wallets
  connectors: [
    injected(), // This handles MetaMask, Rabby, Brave Wallet, etc.
    coinbaseWallet({ appName: 'Aurion Protocol' }),
  ],

  // 3. Define the RPC transport (how we read data)
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
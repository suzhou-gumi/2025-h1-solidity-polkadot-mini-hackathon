'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';

// TODO: Replace with your actual Project ID from WalletConnect Cloud
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in environment variables. Please add it to your .env.local file.");
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Asset Hub Frontend',
  projectId: projectId,
  chains: [
    mainnet,
    sepolia,
    polygon,
    optimism,
    arbitrum,
    base,
    // TODO: Add any other chains your dApp supports, including custom/local chains for development
  ],
  ssr: true, // Enable SSR if using Next.js App Router
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    // TODO: Configure transports for any additional chains
  },
  // TODO: Add walletConnectMetadata if needed for WalletConnect v2
  // walletConnectMetadata: {
  //   name: 'Asset Hub Frontend',
  //   description: 'Interact with Asset Hub smart contracts',
  //   url: 'https://your-dapp-url.com', // replace with your dApp's URL
  //   icons: ['https://your-dapp-url.com/icon.png'], // replace with your dApp's icon URL
  // },
});
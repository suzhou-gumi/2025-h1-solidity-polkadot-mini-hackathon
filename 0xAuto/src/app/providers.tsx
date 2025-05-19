'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme as rainbowDarkTheme,
  lightTheme as rainbowLightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

import { wagmiConfig } from '@/lib/wagmi'; // Adjusted path

const queryClient = new QueryClient();

// Custom RainbowKit theme that adapts to NextThemes
const getCustomRainbowTheme = (resolvedTheme: string | undefined) => {
  if (resolvedTheme === 'dark') {
    return rainbowDarkTheme({
      accentColor: '#7b3fe4', // Example dark theme accent
      accentColorForeground: 'white',
      borderRadius: 'medium',
      fontStack: 'system',
      overlayBlur: 'small',
    });
  }
  return rainbowLightTheme({
    accentColor: '#7b3fe4', // Example light theme accent
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  });
};

function RainbowKitThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Prevent rendering on server to avoid theme mismatch
    return null;
  }

  return (
    <RainbowKitProvider theme={getCustomRainbowTheme(resolvedTheme)}>
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeProvider>{children}</RainbowKitThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NextThemesProvider>
  );
}
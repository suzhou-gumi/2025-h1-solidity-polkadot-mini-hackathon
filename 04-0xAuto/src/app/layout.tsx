import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const iceland = localFont({
  src: '../fonts/Iceland-Regular.ttf',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "0xAuto",
  description: "Automate your trading strategy with 0xAuto",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="h-full">
      <body className={`${iceland.className} ${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

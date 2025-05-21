import type { Metadata } from 'next'
import Header from '@/components/Header'
import Providers from '@/components/Providers'
import { Toaster } from '@/components/ui/sonner'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Mintverse app',
  description:
    'Mintverse is a decentralized marketplace for buying and selling NFTs.',
}

export default function RootLayout({
  children,
}: PagePropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="">
        <Providers>
          <div className="app">
            <Header />
            <main>
              <div className="main-content">
                {children}
              </div>
            </main>
          </div>
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  )
}

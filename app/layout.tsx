import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { NetworkProvider } from './network-provider';
import { Navigation } from './navigation';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Pacifica Explorer',
  description: 'Block-explorer style explorer for the Pacifica exchange',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-zinc-950 text-zinc-50 font-sans min-h-screen antialiased" suppressHydrationWarning>
        <NetworkProvider>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </NetworkProvider>
      </body>
    </html>
  );
}

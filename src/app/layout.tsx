import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import 'lxgw-wenkai-lite-webfont/lxgwwenkailite-regular.css';
import 'lxgw-wenkai-lite-webfont/lxgwwenkailite-bold.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Issay - 说说',
  description: '基于 GitHub Issues 的个人说说平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Montserrat, Fira_Mono } from 'next/font/google';
import './globals.css';
import Head from 'next/head';
import QueryProvider from '@/providers/query-provider';

const montserratFont = Montserrat({
  variable: '--font-montserrat-sans',
  subsets: ['latin'],
});

const firaMono = Fira_Mono({
  variable: '--font-fira-mono',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Hosting Demo PWA',
  description: 'Hosting Demo PWA using Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className={`${montserratFont.variable} ${firaMono.variable}`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

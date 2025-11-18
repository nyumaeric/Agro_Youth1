import type { Metadata } from "next";
import { Jost } from 'next/font/google'
import "./globals.css";
import PWARegister from "@/components/ui/pwa-register";
import OfflineToggle from "./components/offline-toggle";

const jost = Jost({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Agro Youth',
  description: 'Your app description',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Agro Youth',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={jost.className}>
        <PWARegister />
        {/* <OfflineToggle /> */}
        {children}
      </body>
    </html>
  );
}
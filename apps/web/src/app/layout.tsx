import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "criator_stories",
  description: "criator_stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adlawon",
  description: "Your Life In Control",
  icons: {
    icon: "/adlawon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#e6e1e1]`}
      >
        <div className="flex justify-center items-center h-screen w-screen">
          <div className="relative max-w-xl w-full min-h-screen bg-white">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

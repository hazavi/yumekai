import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

// Modern clean fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yumekai Anime",
    template: "%s | Yumekai Anime",
  },
  description:
    "Stream trending, top airing, and newly added anime with a sleek glassmorphism interface.",
  keywords: [
    "anime",
    "streaming",
    "trending anime",
    "top airing",
    "glassmorphism",
    "yumekai",
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-black min-h-screen text-white selection:bg-fuchsia-500/30 selection:text-white`}
      >
        {/* Pure black canvas for seamless hero blend */}
        <div className="fixed inset-0 -z-10 bg-black" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

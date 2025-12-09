import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteLock } from "@/components/SiteLock";
import { AuthProvider } from "@/contexts";
import { Analytics } from "@vercel/analytics/next";
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
    default: "Yumekai",
    template: "%s | Yumekai",
  },
  description: "Stream trending, top airing, and newly added anime.",
  keywords: ["anime", "streaming", "trending anime", "top airing", "yumekai"],
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
        <AuthProvider>
          <SiteLock>
            <Analytics />

            {/* Pure black canvas for seamless hero blend */}
            <div className="fixed inset-0 -z-10 bg-black" />
            <Navbar />
            <main className="min-h-screen">{children}</main>

            {/* Footer */}
            <footer className="bg-black/80 border-t border-white/10 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4 md:py-6">
                <div className="text-center text-xs md:text-sm text-white/60">
                  <p>
                    Yumekai does not store any files on our server, we only
                    linked to the media which is hosted on 3rd party services.
                  </p>
                  © {new Date().getFullYear()} Yumekai. All rights reserved.
                </div>
              </div>
            </footer>

            {/* Scroll to Top Button */}
            <ScrollToTop />
          </SiteLock>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "./_lib/AppDataContext";
import { AuthProvider } from "./_lib/AuthContext";
import AuthGate from "./_components/AuthGate";
import ServiceWorkerRegister from "./_components/ServiceWorkerRegister";
import { ToastProvider } from "./_components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vakıf Gelir Gider Takip",
  description: "Vakıf gelir ve gider takip paneli",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vakıf Takip",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <ToastProvider>
          <AuthProvider>
            <AuthGate>
              <AppDataProvider>{children}</AppDataProvider>
            </AuthGate>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@propelauth/nextjs/client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UnifyMD",
  description:
    "UnifyMD is a unified health record system that aggregates patient data and historical health records. It features an AI-powered search bot that leverages a patient's historical data to help healthcare providers make more informed medical decisions with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <AuthProvider authUrl={process.env.NEXT_PUBLIC_AUTH_URL!}>
        <body>
          <Navbar />
          <div className="p-8">{children}</div>
          <Toaster position="top-center" richColors />
        </body>
      </AuthProvider>
    </html>
  );
}

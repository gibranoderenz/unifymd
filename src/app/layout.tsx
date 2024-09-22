import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@propelauth/nextjs/client";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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

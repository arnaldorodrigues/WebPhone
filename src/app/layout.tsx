import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SipProvider } from "@/hooks/use-sip-context";
import { PhoneStateProvider } from "@/hooks/use-phonestate-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Browser Phone",
  description: "A web-based phone application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PhoneStateProvider>
          <SipProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
              <div className="max-w-7xl min-h-screen flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </div>
          </SipProvider>
        </PhoneStateProvider>
      </body>
    </html>
  );
}

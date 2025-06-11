import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { SipProvider } from "@/hooks/use-sip-context";
import { SIPProvider } from "@/hooks/sip-provider/sip-provider";
import { PhoneStateProvider } from "@/hooks/use-phonestate-context";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

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
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body className={inter.className}>
        {/* <ProtectedRoute> */}
        <PhoneStateProvider>
          <SIPProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
              <div className="max-w-7xl min-h-screen flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </div>
          </SIPProvider>
        </PhoneStateProvider>
        {/* </ProtectedRoute> */}
      </body>
    </html>
  );
}

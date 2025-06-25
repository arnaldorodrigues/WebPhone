import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SIPProvider } from "@/hooks/sip-provider/sip-provider";
import { PhoneStateProvider } from "@/hooks/use-phonestate-context";
import { UserDataProvider } from "@/hooks/use-userdata";
import { NotificationProvider } from "@/contexts/notification-context";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { WebSocketProvider } from "@/contexts/websocket-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3C Web Phone",
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
        <NotificationProvider>
          <UserDataProvider>
            <PhoneStateProvider>
              <SIPProvider>
                <ProtectedRoute>
                  <WebSocketProvider>
                    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
                      <div className="max-w-7xl min-h-screen flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                      </div>
                    </div>
                  </WebSocketProvider>
                </ProtectedRoute>
              </SIPProvider>
            </PhoneStateProvider>
          </UserDataProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

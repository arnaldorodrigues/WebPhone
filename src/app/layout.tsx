import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3C Web Phone",
  description: "A web-based phone application",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body className={inter.className}>
        <div className="bg-gradient-to-br from-indigo-50 to-white">
          <div className="max-w-7xl flex flex-col mx-auto my-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <main className="overflow-hidden bg-white flex-1 relative">
              <AuthProvider>                
                {children}
              </AuthProvider>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

export default RootLayout
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SipProvider } from "@/hooks/use-sip-context";

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
        <SipProvider>{children}</SipProvider>
      </body>
    </html>
  );
}

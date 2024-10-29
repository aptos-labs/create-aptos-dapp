import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { TopBanner } from "@/components/TopBanner";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "NextJS Boilerplate Template",
  title: "NextJS Boilerplate Template",
  description: "NextJS Boilerplate Template",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ReactQueryProvider>
            <div id="root">{children}</div>
            <WrongNetworkAlert />
            <TopBanner />
            <Toaster />
          </ReactQueryProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

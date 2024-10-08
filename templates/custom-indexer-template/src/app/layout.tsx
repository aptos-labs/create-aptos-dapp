import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { PropsWithChildren } from "react";
import { RootHeader } from "@/components/RootHeader";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { QueryProvider } from "@/components/QueryProvider";
import { RootFooter } from "@/components/RootFooter";
import { TopBanner } from "@/components/TopBanner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Aptos Full Stack Demo",
  description: "An demo of a full stack app on Aptos",
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex justify-center min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <WalletProvider>
              <main className="flex flex-col w-full max-w-[1000px] p-6 pb-12 md:px-8 gap-6">
                <WrongNetworkAlert />
                <TopBanner />
                <RootHeader />
                {children}
                <Toaster />
                <RootFooter />
              </main>
            </WalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;

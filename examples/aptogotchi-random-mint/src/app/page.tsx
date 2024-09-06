"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Connected } from "@/components/Home/Connected";
import { NotConnected } from "@/components/Home/NotConnected";
import { WalletButtons } from "@/components/WalletButtons";

const FixedSizeWrapper = ({ children }: PropsWithChildren) => {
  const fixedStyle = {
    width: "1200px",
    height: "800px",
    border: "6px solid",
    margin: "auto",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={fixedStyle}>{children}</div>
    </div>
  );
};

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="flex flex-col">
      <FixedSizeWrapper>
        <Header />
        {connected ? <Connected /> : <NotConnected />}
      </FixedSizeWrapper>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 flex justify-between items-center px-6 py-4 bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 shadow-md w-full gap-2">
      <h1 className="text-2xl">Aptogotchi</h1>
      <DynamicWalletButtons />
    </header>
  );
}

const DynamicWalletButtons = dynamic(
  async () => {
    return { default: WalletButtons };
  },
  {
    loading: () => (
      <div className="nes-btn is-primary opacity-50 cursor-not-allowed">
        Loading...
      </div>
    ),
    ssr: false,
  }
);

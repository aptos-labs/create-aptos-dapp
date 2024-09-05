import React, { createContext, useContext, useEffect, useState } from "react";
import { Mizu } from "@mizuwallet-sdk/core";
import { Network } from "@aptos-labs/ts-sdk";
import { MIZU_WALLET_APP_ID } from "@/constants";

interface MizuWalletContextType {
  mizuClient?: Mizu;
  userAddress?: string;
  setMizuClient: (account?: Mizu) => void;
  setUserAddress: (address?: string) => void;
}

const MizuWalletContext = createContext<MizuWalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mizuClient, setMizuClient] = useState<Mizu>();
  const [userAddress, setUserAddress] = useState<string>();

  useEffect(() => {
    if (localStorage.getItem("auto-connect") === "true") {
      const mizu = new Mizu({
        appId: MIZU_WALLET_APP_ID,
        network: Network.TESTNET,
      });
      mizu
        .loginInTG((window as any).Telegram.WebApp.initData)
        .then(() => {
          setMizuClient(mizu);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <MizuWalletContext.Provider value={{ mizuClient, setMizuClient, userAddress, setUserAddress }}>
      {children}
    </MizuWalletContext.Provider>
  );
};

export const useMizuWallet = () => {
  const context = useContext(MizuWalletContext);
  if (!context) {
    throw new Error("useMizuWallet must be used within a MizuWalletProvider");
  }
  return context;
};

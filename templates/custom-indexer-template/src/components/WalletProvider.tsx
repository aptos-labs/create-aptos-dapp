"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { useToast } from "@/components/ui/use-toast";
import { APTOS_API_KEY, NETWORK } from "@/constants";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKey: APTOS_API_KEY }}
      optInWallets={[
        "Petra",
        "Nightly",
        "Pontem Wallet",
        "Mizu Wallet",
      ]}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

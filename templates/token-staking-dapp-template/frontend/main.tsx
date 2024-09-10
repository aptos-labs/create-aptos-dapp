import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { WalletProvider } from "@/components/WalletProvider.tsx";
import { TokenDataContextProvider } from "@/providers/tokenData";
import { PoolDataContextProvider } from "@/providers/poolData";
import { AccountDataContextProvider } from "@/providers/accountData";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <TokenDataContextProvider>
          <PoolDataContextProvider>
            <AccountDataContextProvider>
              <TooltipProvider delayDuration={100}>
                <App />
                <WrongNetworkAlert />
                <Toaster />
              </TooltipProvider>
            </AccountDataContextProvider>
          </PoolDataContextProvider>
        </TokenDataContextProvider>
      </QueryClientProvider>
    </WalletProvider>
  </React.StrictMode>,
);

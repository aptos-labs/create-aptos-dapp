import React from "react";
import ReactDOM from "react-dom/client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";

import "./index.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => {
        console.log("Custom error handling", error);
      }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={100}>
          <App />
        </TooltipProvider>
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);

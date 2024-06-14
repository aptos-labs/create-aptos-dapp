import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import App from "./App";

// CSS files
import "./index.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { TooltipProvider } from "./components/ui/tooltip";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => {
        console.log(error);
      }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);

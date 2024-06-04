import React from "react";
import ReactDOM from "react-dom/client";
// wallet adapter
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
// wallets
import { PontemWallet } from "@pontem/wallet-adapter-plugin";

import App from "./App";
import "./index.css";

const wallets = [new PontemWallet()];

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error) => {
        console.log("Custom error handling", error);
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);

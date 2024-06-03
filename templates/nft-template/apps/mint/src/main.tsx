import React from "react";
import ReactDOM from "react-dom/client";
// wallet adapter
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

// style - order matters
import "../app/globals.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={true}
      onError={(error) => {
        console.log("Custom error handling", error);
      }}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import App from "./App.tsx";

import "./index.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
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

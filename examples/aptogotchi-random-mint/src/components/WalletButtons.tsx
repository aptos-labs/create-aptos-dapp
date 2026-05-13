"use client";

import {
  useWallet,
  WalletReadyState,
  type AdapterWallet,
} from "@aptos-labs/wallet-adapter-react";
import { cn } from "@/utils/styling";

const buttonStyles = "nes-btn is-primary";

export const WalletButtons = () => {
  const { wallets, connected, disconnect, isLoading } = useWallet();

  if (connected) {
    return (
      <div className="flex flex-row">
        <div
          className={cn(buttonStyles, "hover:bg-blue-700 btn-small")}
          onClick={disconnect}
        >
          Disconnect
        </div>
      </div>
    );
  }

  if (isLoading || !wallets || !wallets[0]) {
    return (
      <div className={cn(buttonStyles, "opacity-50 cursor-not-allowed")}>
        Loading...
      </div>
    );
  }

  return <WalletView wallet={wallets[0]} />;
};

const WalletView = ({ wallet }: { wallet: AdapterWallet }) => {
  const { connect } = useWallet();
  const isWalletReady = wallet.readyState === WalletReadyState.Installed;

  const onWalletConnectRequest = async (walletName: AdapterWallet["name"]) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.warn(error);
      window.alert("Failed to connect wallet");
    }
  };

  return (
    <button
      className={cn(
        buttonStyles,
        isWalletReady ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed",
      )}
      disabled={!isWalletReady}
      key={wallet.name}
      onClick={() => onWalletConnectRequest(wallet.name)}
      style={{ maxWidth: "300px" }}
    >
      Connect Wallet
    </button>
  );
};

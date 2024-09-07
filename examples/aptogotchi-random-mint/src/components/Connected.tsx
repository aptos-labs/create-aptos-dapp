"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";

import { Mint } from "@/components/Mint";
import { Modal } from "@/components/Modal";

export function Connected() {
  const { network } = useWallet();
  return (
    <div className="flex flex-col gap-3 p-3">
      {network?.name.toLowerCase() !==
        NetworkToNetworkName[Network.TESTNET].toLowerCase() && <Modal />}
      <Mint />
    </div>
  );
}

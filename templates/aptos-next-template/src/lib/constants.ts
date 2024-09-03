import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network =
	(process.env.NEXT_PUBLIC_NETWORK as Network) ?? "testnet";

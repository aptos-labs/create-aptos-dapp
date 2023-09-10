import { createClient } from "@thalalabs/surf";
import { Network, Provider } from "aptos";
import { ABI } from "../abi";

export const network =
  import.meta.env.VITE_APP_NETWORK === "devnet"
    ? Network.DEVNET
    : import.meta.env.VITE_APP_NETWORK === "testnet"
    ? Network.TESTNET
    : import.meta.env.VITE_APP_NETWORK === "mainnet"
    ? Network.MAINNET
    : Network.LOCAL;

export const provider = new Provider(network);
export const client = createClient({
  nodeUrl: provider.aptosClient.nodeUrl,
}).useABI(ABI);

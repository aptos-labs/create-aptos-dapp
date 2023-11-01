import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { Network, Provider } from "aptos";

export const network =
  import.meta.env.VITE_APP_NETWORK === "devnet"
    ? Network.DEVNET
    : import.meta.env.VITE_APP_NETWORK === "testnet"
    ? Network.TESTNET
    : import.meta.env.VITE_APP_NETWORK === "mainnet"
    ? Network.MAINNET
    : Network.LOCAL;

export const provider = new Provider(network);
export const aptos = new Aptos(new AptosConfig({ network }));

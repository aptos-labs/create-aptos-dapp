import { Network } from "@aptos-labs/ts-sdk";

export const NETWORK = (process.env.NEXT_PUBLIC_APP_NETWORK ||
  "testnet") as Network;
export const MODULE_ADDRESS = process.env
  .NEXT_PUBLIC_MODULE_ADDRESS as `0x${string}`;

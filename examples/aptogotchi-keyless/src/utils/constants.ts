import { Network } from "@aptos-labs/ts-sdk";

export const BODY_OPTIONS = 5;
export const EAR_OPTIONS = 6;
export const FACE_OPTIONS = 4;
export const ENERGY_INCREASE = 2;
export const ENERGY_DECREASE = 2;
export const ENERGY_CAP = 10;

export const NETWORK = (process.env.NEXT_PUBLIC_APP_NETWORK ||
  "testnet") as Network;
export const MODULE_ADDRESS = process.env
  .NEXT_PUBLIC_MODULE_ADDRESS as `0x${string}`;

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL;

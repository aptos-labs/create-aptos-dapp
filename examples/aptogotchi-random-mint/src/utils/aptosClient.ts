import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";

import { ABI } from "@/utils/abi";

import { NETWORK } from "./constants";

const aptos = new Aptos(new AptosConfig({ network: NETWORK }));
const surf = createSurfClient(aptos).useABI(ABI);

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}

export function surfClient() {
  return surf;
}

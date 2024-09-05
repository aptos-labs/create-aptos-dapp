import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

import { NETWORK } from "@/constants";

const aptos = new Aptos(new AptosConfig({ network: NETWORK }));

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}

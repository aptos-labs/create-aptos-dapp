import { NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

export function aptosClient() {
  const aptos = new Aptos(new AptosConfig({ network: NETWORK }));
  return aptos;
}

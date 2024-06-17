import { createSurfClient } from "@thalalabs/surf";
import { NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { ABI } from "@/utils/abi";

export function aptosClient() {
  const aptos = new Aptos(new AptosConfig({ network: NETWORK }));
  return aptos;
}

export function surfClient() {
  const surf = createSurfClient(aptosClient()).useABI(ABI);
  return surf;
}

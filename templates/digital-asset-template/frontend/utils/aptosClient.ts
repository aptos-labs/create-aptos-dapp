import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

export function aptosClient() {
  const aptos = new Aptos(
    new AptosConfig({ network: import.meta.env.VITE_APP_NETWORK })
  );
  return aptos;
}

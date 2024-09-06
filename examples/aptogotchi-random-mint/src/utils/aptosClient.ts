import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export function aptosClient() {
  const config = new AptosConfig({
    network: Network.TESTNET,
  });
  return new Aptos(config);
}

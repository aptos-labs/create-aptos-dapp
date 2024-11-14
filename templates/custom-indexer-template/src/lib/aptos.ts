import { APTOS_API_KEY, NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const APTOS_CLIENT = new Aptos(
  new AptosConfig({
    network: NETWORK,
    clientConfig: { API_KEY: APTOS_API_KEY },
  })
);

export const getAptosClient = () => APTOS_CLIENT;

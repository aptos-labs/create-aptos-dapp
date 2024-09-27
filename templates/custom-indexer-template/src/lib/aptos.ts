import { NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const APTOS_CLIENT = new Aptos(
  new AptosConfig({
    network: NETWORK,
  })
);

export const getAptosClient = () => APTOS_CLIENT;

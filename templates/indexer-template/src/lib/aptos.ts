import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";

import { ABI } from "@/lib/abi/message_board_abi";

export const NETWORK = Network.TESTNET;

const APTOS_CLIENT = new Aptos(
  new AptosConfig({
    network: NETWORK,
  })
);

const SURF_CLIENT = createSurfClient(APTOS_CLIENT).useABI(ABI);

export const getAptosClient = () => APTOS_CLIENT;

export const getSurfClient = () => SURF_CLIENT;

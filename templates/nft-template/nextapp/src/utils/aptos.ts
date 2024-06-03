import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";
import { ABI as abi_nft_launchpad } from "./abi_nft_launchpad";
import { ABI as abi_collection } from "./abi_collection";

const config = new AptosConfig({
  network: Network.TESTNET,
});
export const aptosClient = new Aptos(config);
export const nftLaunchpadClient =
  createSurfClient(aptosClient).useABI(abi_nft_launchpad);
export const collectionClient =
  createSurfClient(aptosClient).useABI(abi_collection);

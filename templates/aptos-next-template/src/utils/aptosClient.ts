import { NETWORK } from "@/lib/constants";
import {
  AptosFaucetClient,
  type FundRequest,
} from "@aptos-labs/aptos-faucet-client";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";

const aptos = new Aptos(new AptosConfig({ network: NETWORK }));
const surf = createSurfClient(aptos);

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}

export function surfClient() {
  return surf;
}

export async function callFaucet(
  amount: number,
  address: string,
): Promise<string[]> {
  const faucetClient = new AptosFaucetClient({
    BASE: `https://faucet.${process.env.NEXT_PUBLIC_APP_NETWORK}.aptoslabs.com`,
  });
  const request: FundRequest = {
    amount,
    address,
  };
  const response = await faucetClient.fund.fund({ requestBody: request });
  return response.txn_hashes;
}

import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

type GetMintEnabledArguments = {
  fa_address: string;
};

export const getMintEnabled = async ({ fa_address }: GetMintEnabledArguments) => {
  const mintEnabled = await aptosClient().view<[boolean]>({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS)}::launchpad::is_mint_enabled`,
      functionArguments: [fa_address],
    },
  });

  return mintEnabled[0];
};

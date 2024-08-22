import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

type GetUserMintBalanceArguments = {
  collection_id: string;
  mint_stage: string;
  user_address: string;
};

export const getUserMintBalance = async ({ collection_id, mint_stage, user_address }: GetUserMintBalanceArguments) => {
  const userMintedAmount = await aptosClient().view<[string]>({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS)}::launchpad::get_mint_balance`,
      functionArguments: [collection_id, mint_stage, user_address],
    },
  });

  return Number(userMintedAmount[0]);
};

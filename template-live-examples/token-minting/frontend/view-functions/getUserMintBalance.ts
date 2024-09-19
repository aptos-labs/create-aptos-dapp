import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

type GetUserMintBalanceArguments = {
  fa_address: string;
  user_address: string;
};

export const getUserMintBalance = async ({ fa_address, user_address }: GetUserMintBalanceArguments) => {
  const userMintedAmount = await aptosClient().view<[string]>({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS)}::launchpad::get_mint_balance`,
      functionArguments: [fa_address, user_address],
    },
  });

  return Number(userMintedAmount[0]);
};

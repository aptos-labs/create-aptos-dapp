import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export interface UserStakeData {
  amount: string;
  last_claim_ts: string;
  index: string;
}

export const getUserStakeData = async (accountAddress: string | undefined): Promise<UserStakeData | null> => {
  try {
    const userOnChainStakeData = await aptosClient().view<string[]>({
      payload: {
        function: `${MODULE_ADDRESS}::stake_pool::get_user_stake_data`,
        functionArguments: [accountAddress],
      },
    });

    const userStakeData = {
      amount: userOnChainStakeData[0],
      last_claim_ts: userOnChainStakeData[1],
      index: userOnChainStakeData[2],
    };

    return userStakeData;
  } catch (error: any) {
    return null;
  }
};

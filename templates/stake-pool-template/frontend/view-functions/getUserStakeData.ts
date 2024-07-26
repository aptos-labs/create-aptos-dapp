import { aptosClient } from "@/utils/aptosClient";

export const getUserStakeData = async (
  accountAddress: string | undefined,
): Promise<{ amount: string; last_claim_ts: string; index: string } | null> => {
  if (!accountAddress) return null;
  const userOnChainStakeData = await aptosClient().view<string[]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_user_stake_data`,
      functionArguments: [accountAddress],
    },
  });

  const userStakeData = {
    amount: userOnChainStakeData[0],
    last_claim_ts: userOnChainStakeData[1],
    index: userOnChainStakeData[2],
  };

  return userStakeData;
};

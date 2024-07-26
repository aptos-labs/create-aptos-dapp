import { aptosClient } from "@/utils/aptosClient";

export const getUserHasStake = async (accountAddress: string | undefined): Promise<boolean> => {
  if (!accountAddress) return false;
  const userHasStaked = await aptosClient().view<[boolean]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::exists_user_stake`,
      functionArguments: [accountAddress],
    },
  });

  return userHasStaked[0];
};

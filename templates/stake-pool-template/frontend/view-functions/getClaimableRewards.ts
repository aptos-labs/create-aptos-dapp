import { aptosClient } from "@/utils/aptosClient";

export const getClaimableRewards = async (accountAddress: string | undefined): Promise<number> => {
  if (!accountAddress) return 0;
  const rewards = await aptosClient().view<[number]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_claimable_reward`,
      functionArguments: [accountAddress],
    },
  });

  return rewards[0];
};

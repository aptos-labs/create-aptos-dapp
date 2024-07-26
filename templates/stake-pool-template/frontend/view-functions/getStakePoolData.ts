import { aptosClient } from "@/utils/aptosClient";

export const getStakePoolData = async (): Promise<{
  fa_metadata_object: string;
  reward_store: string;
  total_staked: string;
}> => {
  const stakePoolOnChainData = await aptosClient().view<string[]>({
    payload: {
      function: `${import.meta.env.VITE_MODULE_ADDRESS}::stake_pool::get_stake_pool_data`,
      functionArguments: [],
    },
  });

  const stakePoolData = {
    fa_metadata_object: stakePoolOnChainData[0],
    reward_store: stakePoolOnChainData[1],
    total_staked: stakePoolOnChainData[2],
  };

  return stakePoolData;
};

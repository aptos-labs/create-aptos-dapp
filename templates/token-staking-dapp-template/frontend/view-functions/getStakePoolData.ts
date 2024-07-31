import { aptosClient } from "@/utils/aptosClient";

export interface StakePoolDataResponse {
  fa_metadata_object: string;
  reward_store: string;
  total_staked: string;
  unique_stakers: string;
}

export const getStakePoolData = async (): Promise<StakePoolDataResponse | null> => {
  try {
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
      unique_stakers: stakePoolOnChainData[3],
    };

    return stakePoolData;
  } catch (error: any) {
    return null;
  }
};

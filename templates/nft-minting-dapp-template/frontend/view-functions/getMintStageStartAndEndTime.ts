import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

type GetMintStageStartAndEndTimeArguments = {
  collection_id: string;
  mint_stage: string;
};

export const getMintStageStartAndEndTime = async ({
  collection_id,
  mint_stage,
}: GetMintStageStartAndEndTimeArguments) => {
  const startAndEndRes = await aptosClient().view<[string, string]>({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS)}::launchpad::get_mint_stage_start_and_end_time`,
      functionArguments: [collection_id, mint_stage],
    },
  });

  const [start, end] = startAndEndRes;
  return {
    startDate: new Date(parseInt(start, 10) * 1000),
    endDate: new Date(parseInt(end, 10) * 1000),
    // isMintInfinite is true if the mint stage is 100 years later
    isMintInfinite: parseInt(end, 10) === parseInt(start, 10) + 100 * 365 * 24 * 60 * 60,
  };
};

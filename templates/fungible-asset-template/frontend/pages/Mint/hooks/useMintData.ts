import { config } from "@/config";
import { aptosClient } from "@/utils/aptosClient";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

export interface FungibleAsset {
  maximum_v2: number;
  supply_v2: number;
  name: string;
  symbol: string;
  decimals: number;
  asset_type: string;
  icon_uri: string;
}

interface MintQueryResult {
  fungible_asset_metadata: Array<FungibleAsset>;
  current_fungible_asset_balances_aggregate: {
    aggregate: {
      count: number;
    };
  };
  current_fungible_asset_balances: Array<{
    amount: number;
  }>;
}

interface MintData {
  maxSupply: number;
  currentSupply: number;
  uniqueHolders: number;
  yourBalance: number;
  totalAbleToMint: number;
  asset: FungibleAsset;

  startDate: Date;
  endDate: Date;
  isMintActive: boolean;
  isMintInfinite: boolean;
}

// async function getStartAndEndTime(
//   collection_id: string
// ): Promise<[start: Date, end: Date]> {
//   const mintStageRes = await aptosClient().view<[{ vec: [string] }]>({
//     payload: {
//       function: `${AccountAddress.from(
//         MODULE_ADDRESS
//       )}::launchpad::get_active_or_next_mint_stage`,
//       functionArguments: [collection_id],
//     },
//   });

//   const mintStage = mintStageRes[0].vec[0];

//   const startAndEndRes = await aptosClient().view<[string, string]>({
//     payload: {
//       function: `${AccountAddress.from(
//         MODULE_ADDRESS
//       )}::launchpad::get_mint_stage_start_and_end_time`,
//       functionArguments: [collection_id, mintStage],
//     },
//   });

//   const [start, end] = startAndEndRes;
//   return [
//     new Date(parseInt(start, 10) * 1000),
//     new Date(parseInt(end, 10) * 1000),
//   ];
// }

async function getMintLimit(asset_id: string): Promise<number> {
  const mintLimitRes = await aptosClient().view<[{ vec: [string] }]>({
    payload: {
      function: `${AccountAddress.from(
        MODULE_ADDRESS
      )}::launchpad::get_mint_limit`,
      functionArguments: [asset_id],
    },
  });

  return Number(mintLimitRes[0].vec[0]);
}

export function useMintData(asset_id: string = config.asset_id) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["app-state", asset_id],
    refetchInterval: 1000 * 30,
    enabled: !!account,
    queryFn: async () => {
      try {
        if (!asset_id) return null;

        // const [startDate, endDate] = await getStartAndEndTime(asset_id);
        const startDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const res = await aptosClient().queryIndexer<MintQueryResult>({
          query: {
            variables: {
              asset_id,
              account: account?.address.toString(),
            },
            query: `
            query FungibleQuery($asset_id: String, $account: String) {
              fungible_asset_metadata(where: {asset_type: {_eq: $asset_id}}) {
                maximum_v2
                supply_v2
                name
                symbol
                decimals
                asset_type
                icon_uri
              }
              current_fungible_asset_balances_aggregate(
                distinct_on: owner_address
                where: {asset_type: {_eq: $asset_id}}
              ) {
                aggregate {
                  count
                }
              }
              current_fungible_asset_balances(
                where: {owner_address: {_eq: $account}, asset_type: {_eq: $asset_id}}
                distinct_on: asset_type
                limit: 1
              ) {
                amount
              }
            }`,
          },
        });

        const asset = res.fungible_asset_metadata[0];
        if (!asset) return null;

        return {
          maxSupply: asset.maximum_v2 ?? 0,
          currentSupply: asset.supply_v2 ?? 0,
          uniqueHolders:
            res.current_fungible_asset_balances_aggregate.aggregate.count ?? 0,
          asset,
          endDate,
          startDate,
          isMintActive: new Date() >= startDate && new Date() <= endDate,
          isMintInfinite: endDate >= oneYearLater,
          totalAbleToMint: await getMintLimit(asset_id),
          yourBalance: res.current_fungible_asset_balances[0]?.amount ?? 0,
        } satisfies MintData;
      } catch (error) {
        console.error(error);
      }
    },
  });
}

import { aptosClient } from "@/utils/aptosClient";

interface FungibleAssetBalancesQueryResult {
  current_fungible_asset_balances_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

/**
 * A react hook to get the total of unique token holders
 */
export async function useGetUniqueHolders(
  fa_address: string = import.meta.env.VITE_FA_ADDRESS,
): Promise<{ uniqueHolders: number }> {
  if (!fa_address) return { uniqueHolders: 0 };
  const res = await aptosClient().queryIndexer<FungibleAssetBalancesQueryResult>({
    query: {
      variables: {
        fa_address,
      },
      query: `query UniqueHolder($fa_address: String) {
        current_fungible_asset_balances_aggregate(
          where: {asset_type: {_eq: $fa_address}}
        ) {
          aggregate {
            count(columns: owner_address, distinct: true)
          }
        }
      }`,
    },
  });
  return {
    uniqueHolders: res.current_fungible_asset_balances_aggregate.aggregate?.count ?? 0,
  };
}

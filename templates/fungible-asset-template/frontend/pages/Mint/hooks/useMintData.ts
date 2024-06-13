import { config } from "@/config";
import { aptosClient } from "@/utils/aptosClient";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";

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
  isMintActive: boolean;
}

async function getMintLimit(asset_id: string): Promise<number> {
  try {
    const mintLimitRes = await aptosClient().view<[{ vec: [string] }]>({
      payload: {
        function: `${AccountAddress.from(
          MODULE_ADDRESS
        )}::launchpad::get_mint_limit`,
        functionArguments: [asset_id],
      },
    });

    return Number(mintLimitRes[0].vec[0]);
  } catch (error) {
    return 0;
  }
}

export function useMintData(asset_id: string = config.asset_id) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["app-state", asset_id],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        if (!asset_id) return null;

        const res = await aptosClient().queryIndexer<MintQueryResult>({
          query: {
            variables: {
              asset_id,
              account: account?.address.toString() ?? "",
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
          asset,
          maxSupply: convertAmountFromOnChainToHumanReadable(
            asset.maximum_v2 ?? 0,
            asset.decimals
          ),
          currentSupply: convertAmountFromOnChainToHumanReadable(
            asset.supply_v2 ?? 0,
            asset.decimals
          ),
          uniqueHolders:
            res.current_fungible_asset_balances_aggregate.aggregate.count ?? 0,
          totalAbleToMint: convertAmountFromOnChainToHumanReadable(
            await getMintLimit(asset_id),
            asset.decimals
          ),
          yourBalance: convertAmountFromOnChainToHumanReadable(
            res.current_fungible_asset_balances[0]?.amount ?? 0,
            asset.decimals
          ),
          isMintActive: asset.maximum_v2 > asset.supply_v2,
        } satisfies MintData;
      } catch (error) {
        return null;
      }
    },
  });
}

import { config } from "@/config";
import { aptosClient, surfClient } from "@/utils/aptosClient";
import { useQuery } from "@tanstack/react-query";

export interface Token {
  token_name: string;
  cdn_asset_uris: {
    cdn_image_uri: string;
    asset_uri: string;
  };
}

export interface Collection {
  creator_address: string;
  collection_id: string;
  collection_name: string;
  current_supply: number;
  max_supply: number;
  uri: string;
  description: string;
  cdn_asset_uris: {
    cdn_animation_uri: string;
    cdn_image_uri: string;
  };
}

interface MintQueryResult {
  start_date: string;
  end_date: string;
  current_collections_v2: Array<Collection>;
  current_collection_ownership_v2_view: {
    owner_address: string;
  };
  current_collection_ownership_v2_view_aggregate: {
    aggregate: {
      count: number;
    };
  };
  current_token_datas_v2: Array<Token>;
}

interface MintData {
  maxSupply: number;
  totalMinted: number;
  uniqueHolders: number;
  collection: Collection;
  startDate: Date;
  endDate: Date;
  isMintActive: boolean;
  isMintInfinite: boolean;
}

async function getStartAndEndTime(
  collection_id: string
): Promise<[start: Date, end: Date]> {
  const mintStageRes = (await surfClient().view.get_active_or_next_mint_stage({
    typeArguments: [],
    functionArguments: [collection_id as `0x{string}`],
  })) as [{ vec: [string] }];

  const mintStage = mintStageRes[0].vec[0];

  const startAndEndRes =
    await surfClient().view.get_mint_stage_start_and_end_time({
      typeArguments: [],
      functionArguments: [collection_id as `0x{string}`, mintStage],
    });

  const [start, end] = startAndEndRes;
  return [
    new Date(parseInt(start, 10) * 1000),
    new Date(parseInt(end, 10) * 1000),
  ];
}

export function useMintData(collection_id: string = config.collection_id) {
  return useQuery({
    queryKey: ["app-state", collection_id],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        if (!collection_id) return null;

        const [startDate, endDate] = await getStartAndEndTime(collection_id);
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const res = await aptosClient().queryIndexer<MintQueryResult>({
          query: {
            variables: {
              collection_id,
            },
            query: `
						query TokenQuery($collection_id: String) {
							current_collections_v2(
								where: { collection_id: { _eq: $collection_id } }
								limit: 1
							) {
                creator_address
                collection_id
								collection_name
								current_supply
								max_supply
								uri
								description
                cdn_asset_uris {
                  cdn_animation_uri
                  cdn_image_uri
                }
							}
							current_collection_ownership_v2_view(
								where: { collection_id: { _eq: $collection_id } }
								order_by: { last_transaction_version: desc }
							) {
								owner_address
							}
							current_collection_ownership_v2_view_aggregate(
								where: { collection_id: { _eq: $collection_id } }
							) {
								aggregate {
									count(distinct: true, columns: owner_address)
								}
							}
						}`,
          },
        });

        const collection = res.current_collections_v2[0];
        if (!collection) return null;

        return {
          maxSupply: collection.max_supply ?? 0,
          totalMinted: collection.current_supply ?? 0,
          uniqueHolders:
            res.current_collection_ownership_v2_view_aggregate.aggregate
              ?.count ?? 0,
          collection,
          endDate,
          startDate,
          isMintActive:
            new Date() >= startDate &&
            new Date() <= endDate &&
            collection.max_supply > collection.current_supply,
          isMintInfinite: endDate >= oneYearLater,
        } satisfies MintData;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });
}

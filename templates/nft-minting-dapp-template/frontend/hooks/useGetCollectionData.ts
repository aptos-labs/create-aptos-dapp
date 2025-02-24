import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import { aptosClient } from "@/utils/aptosClient";
import { getActiveOrNextMintStage } from "@/view-functions/getActiveOrNextMintStage";
import { getMintStageStartAndEndTime } from "@/view-functions/getMintStageStartAndEndTime";
import { getUserMintBalance } from "@/view-functions/getUserMintBalance";
import { COLLECTION_ADDRESS } from "@/constants";
import { getMintEnabled } from "@/view-functions/getMintEnabled";

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
  userMintBalance: number;
  collection: Collection;
  startDate: Date;
  endDate: Date;
  isMintActive: boolean;
  isMintInfinite: boolean;
}

export function useGetCollectionData(collection_address: string = COLLECTION_ADDRESS) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["app-state", collection_address],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        if (!collection_address) return null;

        const res = await aptosClient().queryIndexer<MintQueryResult>({
          query: {
            variables: {
              collection_id: collection_address,
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
							
						}`,
          },
        });

        const collection = res.current_collections_v2[0];
        if (!collection) return null;

        const mintStageRes = await getActiveOrNextMintStage({ collection_address });

        // Only return collection data if no mint stage is found
        if (mintStageRes.length === 0) {
          return {
            maxSupply: collection.max_supply ?? 0,
            totalMinted: collection.current_supply ?? 0,
            userMintBalance: 0,
            collection,
            endDate: new Date(),
            startDate: new Date(),
            isMintActive: false,
            isMintInfinite: false,
          } satisfies MintData;
        }

        const mint_stage = mintStageRes[0];
        const { startDate, endDate, isMintInfinite } = await getMintStageStartAndEndTime({
          collection_address,
          mint_stage,
        });
        const userMintBalance =
          account == null
            ? 0
            : await getUserMintBalance({
                user_address: account.address.toStringLong(),
                collection_address,
                mint_stage,
              });
        const isMintEnabled = await getMintEnabled({ collection_address });

        return {
          maxSupply: collection.max_supply ?? 0,
          totalMinted: collection.current_supply ?? 0,
          userMintBalance,
          collection,
          endDate,
          startDate,
          isMintActive:
            isMintEnabled &&
            new Date() >= startDate &&
            new Date() <= endDate &&
            collection.max_supply > collection.current_supply,
          isMintInfinite,
        } satisfies MintData;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });
}

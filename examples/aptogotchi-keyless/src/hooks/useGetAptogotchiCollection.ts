import { useCallback, useState } from "react";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { queryAptogotchiCollection } from "@/graphql/queryAptogotchiCollection";
import { padAddressIfNeeded } from "@/utils/address";
import { getAptosClient, surfClient } from "@/utils/aptosClient";

interface Collection {
  collection_id: string;
  collection_name: string;
  creator_address: string;
  uri: string;
  current_supply: number;
}

interface CollectionHolder {
  owner_address: string;
}

interface CollectionResponse {
  current_collections_v2: Array<Collection>;
  current_collection_ownership_v2_view: Array<CollectionHolder>;
}

export function useGetAptogotchiCollection() {
  const { keylessAccount } = useKeylessAccount();
  const [collection, setCollection] = useState<Collection>();
  const [firstFewAptogotchiName, setFirstFewAptogotchiName] =
    useState<Array<string>>();
  const [loading, setLoading] = useState(false);

  const fetchCollection = useCallback(async () => {
    if (!keylessAccount) return;

    try {
      setLoading(true);

      const aptogotchiCollectionAddressResponse =
        await surfClient().view.get_aptogotchi_collection_address({
          typeArguments: [],
          functionArguments: [],
        });

      const collectionAddress = padAddressIfNeeded(
        aptogotchiCollectionAddressResponse[0]
      );

      const collectionResponse: CollectionResponse =
        await aptosClient().queryIndexer({
          query: {
            query: queryAptogotchiCollection,
            variables: {
              collection_id: collectionAddress,
            },
          },
        });

      const firstFewAptogotchi = await Promise.all(
        collectionResponse.current_collection_ownership_v2_view
          .filter(
            (holder) =>
              holder.owner_address !== keylessAccount.accountAddress.toString()
          )
          // TODO: change to limit 3 in gql after indexer fix limit
          .slice(0, 3)
          .map((holder) =>
            surfClient().view.get_aptogotchi({
              typeArguments: [],
              functionArguments: [holder.owner_address as `0x${string}`],
            })
          )
      );

      setCollection(collectionResponse.current_collections_v2[0]);
      setFirstFewAptogotchiName(firstFewAptogotchi.map((x) => x[0]));
    } catch (error) {
      console.error("Error fetching Aptogotchi collection:", error);
    } finally {
      setLoading(false);
    }
  }, [keylessAccount]);

  return { collection, firstFewAptogotchiName, loading, fetchCollection };
}

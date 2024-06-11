import { aptosClient } from "@/utils/aptosClient";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { useState, useEffect } from "react";

export type CollectionData = {
  collection_name: string;
  description: string;
  uri: string;
  collection_id: string;
  total_minted_v2: string;
  max_supply: string;
};

/**
 * A react hook to get all collections under the current contract.
 *
 * This call can be pretty expensive when fetching a big number of collections,
 * therefore it is not recommended to use it in production
 *
 */
export function useGetCollections() {
  const [collections, setCollections] = useState<Array<CollectionData>>([]);

  useEffect(() => {
    // fetch the contract registry address
    getRegistry().then((registry) => {
      // fetch collections objects created under that contract registry address
      getObjects(registry).then((objects) => {
        // get each collection object data
        getCollections(objects).then((data) => {
          setCollections(data);
        });
      });
    });
  }, []);

  return collections;
}

const getRegistry = async () => {
  const registry = await aptosClient().view<[[{ inner: string }]]>({
    payload: {
      function: `${AccountAddress.from(
        import.meta.env.VITE_MODULE_ADDRESS
      )}::launchpad::get_registry`,
    },
  });
  return registry[0];
};

const getObjects = async (registry: [{ inner: string }]) => {
  const objects = await Promise.all(
    registry.map(async (register: { inner: string }) => {
      const formattedRegistry = AccountAddress.from(register.inner).toString();
      // TODO use aptos api function once a new release is out
      const object = await aptosClient().queryIndexer<{
        current_objects: [{ owner_address: string }];
      }>({
        query: {
          query: `query MyQuery {
      current_objects(
        where: {object_address: {_eq: "${formattedRegistry}"}}
      ) {
        owner_address
      }
    }`,
        },
      });
      return object.current_objects[0].owner_address;
    })
  );
  return objects;
};

const getCollections = async (objects: Array<string>) => {
  const collections = await Promise.all(
    objects.map(async (object: string) => {
      const formattedObjectAddress = AccountAddress.from(object).toString();

      const collection = await aptosClient().queryIndexer<{
        current_collections_v2: Array<CollectionData>;
      }>({
        query: {
          query: `query MyQuery {
            current_collections_v2(
        where: {creator_address: {_eq: "${formattedObjectAddress}"}}
      ) {
        collection_name
        description
        uri
        collection_id
        total_minted_v2
        max_supply
      }
    }`,
        },
      });
      return collection.current_collections_v2[0];
    })
  );
  return collections;
};

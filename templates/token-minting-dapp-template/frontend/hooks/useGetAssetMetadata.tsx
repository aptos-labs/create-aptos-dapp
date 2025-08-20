import { AccountAddress, GetFungibleAssetMetadataResponse } from "@aptos-labs/ts-sdk";
import { useState, useEffect } from "react";
// Internal utils
import { aptosClient } from "@/utils/aptosClient";
import { getRegistry } from "@/view-functions/getRegistry";

/**
 * A react hook to get fungible asset metadatas.
 *
 * This call can be pretty expensive when fetching a big number of assets,
 * therefore it is not recommended to use it in production
 *
 */
export function useGetAssetMetadata() {
  const [fas, setFAs] = useState<GetFungibleAssetMetadataResponse>([]);

  useEffect(() => {
    // fetch the contract registry address
    getRegistry().then((faObjects) => {
      // fetch fungible assets objects created under that contract registry address
      // get each fungible asset object metadata
      getMetadata(faObjects).then((metadatas) => {
        setFAs(metadatas);
      });
    });
  }, []);

  return fas;
}

const getMetadata = async (objects: Array<{inner: string}>) => {
  const metadatas = await Promise.all(
    objects.map(async (object: {inner: string}) => {
      const formattedObjectAddress = AccountAddress.from(object.inner).toString();

      const metadata = await aptosClient().getFungibleAssetMetadata({
        options: {
          where: { creator_address: { _eq: `${formattedObjectAddress}` } },
        },
      });
      return metadata[0];
    }),
  );
  return metadatas;
};

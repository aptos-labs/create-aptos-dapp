import { Link, useNavigate } from "react-router-dom";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollectionData, useGetCollections } from "@/hooks/useGetCollections";
import { NETWORK } from "@/constants";

export function MyCollections() {
  const collections: Array<CollectionData> = useGetCollections();

  // If we are on Production mode, redierct to the mint page
  const navigate = useNavigate();
  if (import.meta.env.PROD) navigate("/", { replace: true });

  return (
    <>
      <LaunchpadHeader />
      <Table>
        <TableCaption>
          A list of the collections created under the current contract.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Collection</TableHead>
            <TableHead>Collection Address</TableHead>
            <TableHead>Minted NFTs</TableHead>
            <TableHead>Max Supply</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length > 0 &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            collections.map((collection: any) => {
              return (
                <TableRow key={collection.collection_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img
                        src={collection.collection_uri}
                        style={{ width: "40px" }}
                        className="mr-2"></img>
                      <span>{collection.collection_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`https://explorer.aptoslabs.com/object/${collection.collection_id}?network=${NETWORK}`}
                      target="_blank"
                      style={{ textDecoration: "underline" }}>
                      {collection.collection_id}
                    </Link>
                  </TableCell>
                  <TableCell>{collection.total_minted_v2}</TableCell>
                  <TableCell>{collection.max_supply}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}

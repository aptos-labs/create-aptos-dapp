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
import { Link } from "react-router-dom";

export function MyCollections() {
  const collections: any[] = [];

  return (
    <>
      <LaunchpadHeader />
      <Table>
        <TableCaption>
          A list of the collections created under the current contract.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Collection</TableHead>
            <TableHead>Collection Address</TableHead>
            <TableHead>Created NFTs</TableHead>
            <TableHead>Minted NFTs</TableHead>
            <TableHead>Owners</TableHead>
            <TableHead>Mint Page</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length > 0 &&
            collections.map((collection: any) => {
              return (
                <TableRow key={collection.adress}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img
                        src={collection.collection_uri}
                        style={{ width: "40px" }}
                        className="mr-2"
                      ></img>
                      <span>{collection.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`https://explorer.aptoslabs.com/object/${
                        collection.address
                      }?network=${import.meta.env.VITE_APP_NETWORK}`}
                      target="_blank"
                      style={{ textDecoration: "underline" }}
                    >
                      {collection.address}
                    </Link>
                  </TableCell>
                  <TableCell>{collection.created}</TableCell>
                  <TableCell>{collection.minted}</TableCell>
                  <TableCell>{collection.owners}</TableCell>
                  <TableCell>
                    <Link
                      className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      to={"/"}
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}

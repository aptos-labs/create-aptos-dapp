import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { FC } from "react";
import { useMintData } from "../hooks/useMintData";
import { Link } from "react-router-dom";
import { IS_DEV } from "@/constants";
import { config } from "@/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Header: FC = () => {
  const { data } = useMintData();

  return (
    <header className="px-6 pt-6">
      {!config.collection_id && (
        <Alert className="mb-6" variant="destructive">
          <AlertTitle className="body-md-semibold">
            Collection ID not set
          </AlertTitle>
          <AlertDescription className="body-sm">
            This page is placeholder content, to render your collection:
            <ol className="list-decimal list-inside">
              <li>
                Make sure you have created a collection, click the "My
                Collections" button and verify a collection is created.
              </li>
              <li>
                Fill in the{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  collection_id
                </code>{" "}
                field in
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  frontend/config.ts
                </code>
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      <nav className="navbar-container  flex justify-between max-w-screen-xl mx-auto">
        <p className="display">
          {data?.collection.collection_name ?? config.defaultCollection?.name}
        </p>
        <div>
          {IS_DEV && (
            <Link
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              to={"/my-collections"}>
              My Collections
            </Link>
          )}
          <WalletSelector />
        </div>
      </nav>
    </header>
  );
};

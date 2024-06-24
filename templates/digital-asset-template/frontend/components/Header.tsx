import { useGetCollectionData } from "@/hooks/useGetCollectionData";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { IS_DEV } from "@/constants";
import { buttonVariants } from "@/components/ui/button";
import { config } from "@/config";

export function Header() {
  const { data } = useGetCollectionData();

  const title = useMemo(() => {
    return data?.collection.collection_name ?? config.defaultCollection?.name ?? "NFT Collection Launchpad";
  }, [data?.collection]);

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">
        <Link to="/">{title}</Link>
      </h1>

      <div className="flex gap-2 items-center flex-wrap">
        {IS_DEV && (
          <>
            <Link className={buttonVariants({ variant: "link" })} to={"/my-collections"}>
              My Collections
            </Link>
            <Link className={buttonVariants({ variant: "link" })} to={"/create-collection"}>
              Create Collection
            </Link>
          </>
        )}
        <WalletSelector />
      </div>
    </div>
  );
}

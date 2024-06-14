import { useMintData } from "@/pages/Mint/hooks/useMintData";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { IS_DEV } from "@/constants";
import { buttonVariants } from "./ui/button";
import { config } from "@/config";

export function Header() {
  const { data } = useMintData();
  const location = useLocation();

  const isRoot = location.pathname === "/";

  const title = useMemo(() => {
    if (!isRoot) return "NFT Collection Launchpad";
    return (
      data?.collection.collection_name ??
      config.defaultCollection?.name ??
      "NFT Collection Launchpad"
    );
  }, [isRoot, data?.collection]);

  return (
    <div className="flex items-center justify-between px-6 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">
        <Link to="/">{title}</Link>
      </h1>

      <div className="flex gap-2 items-center flex-wrap">
        {IS_DEV && (
          <>
            <Link
              className={buttonVariants({ variant: "secondary" })}
              to={"/my-collections"}>
              My Collections
            </Link>
            <Link
              className={buttonVariants({ variant: "secondary" })}
              to={"/create-collection"}>
              Create Collection
            </Link>
          </>
        )}
        <WalletSelector />
      </div>
    </div>
  );
}

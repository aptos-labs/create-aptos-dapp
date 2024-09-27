import { IS_DEV } from "@/constants";
import { useGetAssetData } from "@/hooks/useGetAssetData";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { buttonVariants } from "./ui/button";
import { config } from "@/config";

export function Header() {
  const { data } = useGetAssetData();
  const location = useLocation();

  const isRoot = location.pathname === "/";

  const title = useMemo(() => {
    if (!isRoot) return "Fungible Asset Launchpad";
    return data?.asset.symbol.toUpperCase() ?? config.defaultAsset?.name ?? "Fungible Asset Launchpad";
  }, [isRoot, data?.asset]);

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">
        <Link to="/">{title}</Link>
      </h1>

      <div className="flex gap-2 items-center flex-wrap">
        {IS_DEV && (
          <>
          <Link className={buttonVariants({ variant: "link" })} to={"/"}>
          Mint Page
        </Link>
            <Link className={buttonVariants({ variant: "link" })} to={"/my-assets"}>
              My Assets
            </Link>
            <Link className={buttonVariants({ variant: "link" })} to={"/create-asset"}>
              Create Asset
            </Link>
          </>
        )}

        <WalletSelector />
      </div>
    </div>
  );
}

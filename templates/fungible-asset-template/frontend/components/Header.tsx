import { IS_DEV } from "@/constants";
import { useMintData } from "@/pages/Mint/hooks/useMintData";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { buttonVariants } from "./ui/button";
import { config } from "@/config";

export function Header() {
  const { data } = useMintData();
  const location = useLocation();

  const isRoot = location.pathname === "/";

  const title = useMemo(() => {
    if (!isRoot) return "Fungible Asset Launchpad";
    return (
      data?.asset.symbol.toUpperCase() ??
      config.defaultAsset?.name ??
      "Fungible Asset Launchpad"
    );
  }, [isRoot, data?.asset]);

  return (
    <div className="flex items-center justify-between px-6 py-2 max-w-screen-xl mx-auto w-full">
      <h1 className="display">
        <Link to="/">{title}</Link>
      </h1>

      <div className="flex gap-2 items-center">
        {IS_DEV && (
          <>
            <Link
              className={buttonVariants({ variant: "secondary" })}
              to={"/my-assets"}
            >
              My Assets
            </Link>
            <Link
              className={buttonVariants({ variant: "secondary" })}
              to={"/create-asset"}
            >
              Create Asset
            </Link>
          </>
        )}

        <WalletSelector />
      </div>
    </div>
  );
}

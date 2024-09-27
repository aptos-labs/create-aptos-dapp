import { FC } from "react";
import { Link } from "react-router-dom";
// Internal components
import { WalletSelector } from "@/components/WalletSelector";
import { buttonVariants } from "@/components/ui/button";

interface LaunchpadHeaderProps {
  title: string;
}

export const LaunchpadHeader: FC<LaunchpadHeaderProps> = ({ title }) => {

  return (
    <div className="flex items-center justify-between py-2 px-4 mx-auto w-full max-w-screen-xl flex-wrap">
      <h2 className="display">{title}</h2>
      <div className="flex gap-2 items-center">
        <Link className={buttonVariants({ variant: "link" })} to={"/"}>
          Mint Page
        </Link>
        <Link className={buttonVariants({ variant: "link" })} to={"/my-assets"}>
          My Assets
        </Link>
        <Link className={buttonVariants({ variant: "link" })} to={"/create-asset"}>
          Create Asset
        </Link>
        <WalletSelector />
      </div>
    </div>
  );
};

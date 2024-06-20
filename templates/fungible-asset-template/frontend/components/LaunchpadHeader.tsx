import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { buttonVariants } from "./ui/button";
import { FC } from "react";

interface LaunchpadHeaderProps {
  title: string;
}

export const LaunchpadHeader: FC<LaunchpadHeaderProps> = ({ title }) => {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between py-2 px-4 mx-auto w-full max-w-screen-xl flex-wrap">
      <h2 className="display">{title}</h2>
      <div className="flex gap-2 items-center">
        <Link className={buttonVariants({ variant: "link" })} to={"/"}>
          Mint Page
        </Link>
        {location.pathname === "/my-assets" ? (
          <Link
            className={buttonVariants({ variant: "link" })}
            to={"/create-asset"}>
            Create Asset
          </Link>
        ) : (
          <Link
            className={buttonVariants({ variant: "link" })}
            to={"/my-assets"}>
            My Assets
          </Link>
        )}

        <WalletSelector />
      </div>
    </div>
  );
};

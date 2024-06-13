import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { buttonVariants } from "./ui/button";

export function LaunchpadHeader() {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between py-2 px-6 mx-auto w-full">
      <Link
        to="https://aptos.dev/standards/fungible-asset"
        style={{ textDecoration: "underline" }}
        target="_blank"
      >
        Learn More About Fungible Assets on Aptos
      </Link>
      <div className="flex gap-2 items-center">
        <Link className={buttonVariants({ variant: "secondary" })} to={"/"}>
          Mint Page
        </Link>
        {location.pathname === "/my-assets" ? (
          <Link
            className={buttonVariants({ variant: "secondary" })}
            to={"/create-asset"}
          >
            Create Asset
          </Link>
        ) : (
          <Link
            className={buttonVariants({ variant: "secondary" })}
            to={"/my-assets"}
          >
            My Assets
          </Link>
        )}

        <WalletSelector />
      </div>
    </div>
  );
}

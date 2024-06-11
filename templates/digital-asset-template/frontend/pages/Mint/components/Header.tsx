import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { FC } from "react";
import { useMintData } from "../hooks/useMintData";
import { Link } from "react-router-dom";
import { IS_DEV } from "@/constants";
import { config } from "@/config";

export const Header: FC = () => {
  const { data } = useMintData();
  // if (!data) return null;

  return (
    <header>
      <nav className="navbar-container px-6 pt-6 flex justify-between max-w-screen-xl mx-auto">
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

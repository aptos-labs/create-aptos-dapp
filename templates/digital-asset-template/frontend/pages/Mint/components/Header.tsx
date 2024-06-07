import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { FC } from "react";
import { useMintData } from "../hooks/useMintData";

export const Header: FC = () => {
  const { data } = useMintData();
  if (!data) return null;

  return (
    <header>
      <nav className="navbar-container px-6 pt-6 flex justify-between max-w-screen-xl mx-auto">
        <p className="display">{data.collection.collection_name}</p>
        <div>
          <WalletSelector />
        </div>
      </nav>
    </header>
  );
};

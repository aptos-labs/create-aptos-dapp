import { useMemo } from "react";
import { WalletSelector } from "./WalletSelector";
import { useGetTokenName } from "@/hooks/useGetTokenName";

export function Header() {
  const tokenName = useGetTokenName();

  const name = useMemo(() => {
    return tokenName ?? "TOKEN Staking";
  }, [tokenName]);

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">{name}</h1>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}

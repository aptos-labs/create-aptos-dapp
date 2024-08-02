import { WalletSelector } from "./WalletSelector";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export function Header() {
  const { tokenData } = useGetTokenData();

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">{tokenData?.name ?? "STAKE TOKEN"}</h1>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}

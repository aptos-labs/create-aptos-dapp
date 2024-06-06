import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  console.log(location.pathname);

  return (
    <div className="flex items-center justify-between px-6 py-2">
      <h1 className="font-bold leading-none tracking-tight md:text-2xl dark:text-white">
        My logo
      </h1>
      <div>
        <WalletSelector />
      </div>
    </div>
  );
}

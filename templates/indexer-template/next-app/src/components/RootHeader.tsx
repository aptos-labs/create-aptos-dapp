import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletSelector } from "@/components/wallet/WalletSelector";
import { IndexerStatus } from "@/components/IndexerStatus";

export const RootHeader = () => {
  return (
    <div className="flex justify-between gap-6 pb-10">
      <div className="flex flex-col gap-2 md:gap-3">
        <h1 className="text-xl sm:text-3xl font-semibold tracking-tight">
          <a href="/">Aptos Full Stack Demo App</a>
        </h1>
        <a
          href="https://github.com/0xaptosj/aptos-full-stack-template/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground underline underline-offset-2 font-medium leading-none"
        >
          Source Code
        </a>
      </div>
      <div className="flex space-x-5 items-center justify-center">
        <IndexerStatus />
        <WalletSelector />
        <ThemeToggle />
      </div>
    </div>
  );
};

import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletSelector } from "@/components/wallet/WalletSelector";

export const RootHeader = () => {
  return (
    <div className="flex justify-between items-center gap-6 pb-5">
      <div className="flex flex-col gap-2 md:gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          <a href="/">Aptos Full Stack Demo App</a>
        </h1>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-10">
         <a
          href="https://github.com/0xaptosj/aptos-full-stack-template/"
          target="_blank"
          rel="noreferrer"
          className="text-base text-muted-foreground font-medium leading-none"
        >
          Source Code
        </a>
        <a
          href="/analytics"
          className="text-base text-muted-foreground font-medium leading-none"
        >
          Analytics
        </a>
      </div>
      <div className="flex space-x-2 items-center justify-center">
        <div className="flex-grow text-right min-w-0">
          <WalletSelector />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};

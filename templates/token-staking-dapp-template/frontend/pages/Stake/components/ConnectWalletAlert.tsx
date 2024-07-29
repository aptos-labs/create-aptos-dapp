import { FC } from "react";
// Internal components
import { WarningAlert } from "@/components/ui/warning-alert";

export const ConnectWalletAlert: FC = () => {
  if (import.meta.env.VITE_FA_ADDRESS) return null;

  return (
    <div className="md:flex-row gap-6 px-4 max-w-screen-xl mx-auto w-full">
      <WarningAlert title="Collection ID not set">
        This page is placeholder content, to render your token data:
        <ol className="list-decimal list-inside">
          <li>
            Make sure you have created a collection, click the "My Collections" button and verify a collection is
            created.
          </li>
          <li>
            Fill in the{" "}
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              token_address
            </code>{" "}
            field in
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              frontend/config.ts
            </code>
          </li>
        </ol>
      </WarningAlert>
    </div>
  );
};

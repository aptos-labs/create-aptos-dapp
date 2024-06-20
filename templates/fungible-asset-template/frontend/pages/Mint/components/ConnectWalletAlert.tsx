import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { config } from "@/config";
import { AlertOctagon } from "lucide-react";
import { FC } from "react";

export const ConnectWalletAlert: FC = () => {
  if (config.asset_id) return null;

  return (
    <div className="px-4">
      <Alert className="max-w-screen-xl w-full mx-auto" variant="warning">
        <AlertOctagon className="w-4 h-5" />
        <AlertTitle className="body-md-semibold">Asset ID not set</AlertTitle>
        <AlertDescription className="body-sm">
          This page is placeholder content, to render your fungible asset:
          <ol className="list-decimal list-inside">
            <li>
              Make sure you have created a fungible asset, click the "My Assets"
              button and verify a collection is created, if not, click "Create
              Asset".
            </li>
            <li>
              Fill in the{" "}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                asset_id
              </code>{" "}
              field in
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                frontend/config.ts
              </code>
            </li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

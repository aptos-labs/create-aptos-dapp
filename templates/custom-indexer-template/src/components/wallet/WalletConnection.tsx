import { DisplayValue, LabelValueGrid } from "@/components/LabelValueGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "@aptos-labs/ts-sdk";
import {
  AccountInfo,
  NetworkInfo,
  WalletInfo,
  isAptosNetwork,
} from "@aptos-labs/wallet-adapter-react";
import Image from "next/image";

interface WalletConnectionProps {
  account: AccountInfo | null;
  network: NetworkInfo | null;
  wallet: WalletInfo | null;
}

export const WalletConnection = ({
  account,
  network,
  wallet,
}: WalletConnectionProps) => {
  const isValidNetworkName = () => {
    if (isAptosNetwork(network)) {
      return Object.values<string | undefined>(Network).includes(network?.name);
    }
    // If the configured network is not an Aptos network, i.e is a custom network
    // we resolve it as a valid network name
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 pt-6">
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Wallet Details</h4>
          <LabelValueGrid
            items={[
              {
                label: "Icon",
                value: wallet?.icon ? (
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                  />
                ) : (
                  "Not Present"
                ),
              },
              {
                label: "Name",
                value: <p>{wallet?.name ?? "Not Present"}</p>,
              },
              {
                label: "URL",
                value: wallet?.url ? (
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-300"
                  >
                    {wallet.url}
                  </a>
                ) : (
                  "Not Present"
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Account Info</h4>
          <LabelValueGrid
            items={[
              {
                label: "Address",
                value: (
                  <DisplayValue
                    value={account?.address.toStringLong() ?? "Not Present"}
                    isCorrect={!!account?.address}
                  />
                ),
              },
              {
                label: "Public key",
                value: (
                  <DisplayValue
                    value={account?.publicKey.toString() ?? "Not Present"}
                    isCorrect={!!account?.publicKey}
                  />
                ),
              },
              {
                label: "ANS name",
                subLabel: "(only if attached)",
                value: <p>{account?.ansName ?? "Not Present"}</p>,
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Network Info</h4>
          <LabelValueGrid
            items={[
              {
                label: "Network name",
                value: (
                  <DisplayValue
                    value={network?.name ?? "Not Present"}
                    isCorrect={isValidNetworkName()}
                    expected={Object.values<string>(Network).join(", ")}
                  />
                ),
              },
              {
                label: "URL",
                value: network?.url ? (
                  <a
                    href={network.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-300"
                  >
                    {network.url}
                  </a>
                ) : (
                  "Not Present"
                ),
              },
              {
                label: "Chain ID",
                value: <p>{network?.chainId ?? "Not Present"}</p>,
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

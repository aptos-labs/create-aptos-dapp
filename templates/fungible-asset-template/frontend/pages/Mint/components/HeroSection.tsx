import { FC, FormEvent, useState } from "react";
import { truncateAddress } from "@/utils/truncateAddress";
import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMintData } from "../hooks/useMintData";
import Copy from "@/assets/icons/copy.svg";
import ExternalLink from "@/assets/icons/external-link.svg";
import { Socials } from "./Socials";
import { MODULE_ADDRESS, NETWORK } from "@/constants";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { useQueryClient } from "@tanstack/react-query";
import Placeholder1 from "@/assets/placeholders/asset.png";
import { config } from "@/config";

interface HeroSectionProps {}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const { data } = useMintData();
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const [assetCount, setAssetCount] = useState(1);

  const { asset, totalAbleToMint = 0, yourBalance = 0 } = data ?? {};

  const mintNft = async (e: FormEvent) => {
    e.preventDefault();
    if (!account || !data?.isMintActive || !asset) return;

    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::launchpad::mint_fa`,
        functionArguments: [
          asset.asset_type,
          assetCount * Math.pow(10, asset.decimals),
        ],
      },
    };
    const response = await signAndSubmitTransaction(transaction);
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
    queryClient.invalidateQueries();
    setAssetCount(1);
  };

  return (
    <section className="hero-container flex flex-col md:flex-row gap-6 px-6 max-w-screen-xl mx-auto w-full">
      <Image
        src={asset?.icon_uri ?? Placeholder1}
        rounded="full"
        className="basis-2/5"
      />
      <div className="basis-3/5 flex flex-col gap-4">
        <h1 className="title-md">{asset?.name ?? config.defaultAsset?.name}</h1>
        <Socials />

        <Card>
          <CardContent
            fullPadding
            className="flex flex-col md:flex-row gap-4 md:justify-between items-start md:items-center"
          >
            <form onSubmit={mintNft} className="flex gap-4 basis-1/3">
              <Input
                type="number"
                disabled={!data?.isMintActive}
                value={assetCount}
                onChange={(e) =>
                  setAssetCount(parseInt(e.currentTarget.value, 10))
                }
              />
              <Button type="submit" disabled={!data?.isMintActive}>
                Mint
              </Button>
            </form>

            <div className="flex flex-col basis-1/3">
              <p className="body-sm">You can mint up to</p>
              <p className="body-md">
                {totalAbleToMint} {asset?.symbol}
              </p>
            </div>

            <div className="flex flex-col basis-1/3">
              <p className="body-sm">Your Balance</p>
              <p className="body-md">
                {yourBalance} {asset?.symbol}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-x-2 items-center flex-wrap justify-between">
          <p className="whitespace-nowrap body-sm-semibold">Address</p>

          <div className="flex gap-x-2">
            <AddressButton address={asset?.asset_type ?? ""} />
            <a
              className={buttonVariants({ variant: "link" })}
              target="_blank"
              href={`https://explorer.aptoslabs.com/account/${asset?.asset_type}?network=${NETWORK}`}
            >
              View on Explorer <Image src={ExternalLink} />
            </a>
          </div>
        </div>

        {/* <div>
          {data?.startDate && new Date() < data.startDate && (
            <div className="flex gap-x-2 justify-between flex-wrap">
              <p className="body-sm-semibold">Minting starts</p>
              <p className="body-sm">{formatDate(data.startDate)}</p>
            </div>
          )}

          {data?.endDate &&
            new Date() < data.endDate &&
            !data.isMintInfinite && (
              <div className="flex gap-x-2 justify-between flex-wrap">
                <p className="body-sm-semibold">Minting ends</p>
                <p className="body-sm">{formatDate(data.endDate)}</p>
              </div>
            )}

          {data?.endDate && new Date() > data.endDate && (
            <p className="body-sm-semibold">Minting has ended</p>
          )}
        </div> */}
      </div>
    </section>
  );
};

const AddressButton: FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (copied) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Button
      onClick={onCopy}
      className="whitespace-nowrap flex gap-1 px-0 py-0"
      variant="link"
    >
      {copied ? (
        "Copied!"
      ) : (
        <>
          {truncateAddress(address)}
          <Image src={Copy} />
        </>
      )}
    </Button>
  );
};

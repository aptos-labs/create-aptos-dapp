import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";

export function CreateCollection() {
  const [maxSupply, setMaxSupply] = useState<string>();
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>();
  const [preMintAmount, setPreMintAmount] = useState<number>();
  const [disableCreateCollectionButton, setDisableCreateCollectionButton] =
    useState<boolean>(true);

  const currentUnixTimestamp = Math.floor(Date.now() / 1000);

  // const [allowlist, setAllowlist] = useState<`0x${string}`[]>([]);
  // const [allowlistStartTime, setAllowlistStartTime] =
  //   useState(currentUnixTimestamp);
  // const [allowlistEndTime, setAllowlistEndTime] = useState(
  //   currentUnixTimestamp + 150
  // );
  // const [allowlistMintLimitPerAddr, setAllowlistMintLimitPerAddr] = useState(2);
  // const [allowlistMintFeePerNft, setAllowlistMintFeePerNft] = useState(10);
  // const [publicMintStartTime, setPublicMintStartTime] = useState(
  //   currentUnixTimestamp + 210
  // );
  // const [publicMintEndTime, setPublicMintEndTime] = useState(
  //   currentUnixTimestamp + 600
  // );
  // const [publicMintLimitPerAddr, setPublicMintLimitPerAddr] = useState(1);
  // const [publicMintFeePerNft, setPublicMintFeePerNft] = useState(100);

  const [collectionName, setCollectionName] = useState<string>();
  const [collectionDescription, setDescription] = useState<string>();
  const [projectUri, setProjectUri] = useState<string>();

  useEffect(() => {
    if (maxSupply && royaltyPercentage && maxSupply && preMintAmount) {
      setDisableCreateCollectionButton(false);
    }
  }, [maxSupply, royaltyPercentage, maxSupply, preMintAmount]);

  const createAsset = async () => {};

  const onUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <>
      <LaunchpadHeader />
      <div className="flex items-center justify-between px-6 py-2">
        <div className="w-2/4">
          <h3 className="font-bold leading-none tracking-tight md:text-xl dark:text-white py-2">
            Create NFT Collection
          </h3>
          <div className="py-2">
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Max Supply</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setMaxSupply(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Royalty Percentage</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setRoyaltyPercentage(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Advanced options</AccordionTrigger>
                  <AccordionContent className="border p-4">
                    <div className="mb-5 flex flex-col item-center space-y-4">
                      <Label>Mint for myself</Label>
                      <Input
                        type="number"
                        value={preMintAmount}
                        onChange={(e) => {
                          setPreMintAmount(parseInt(e.target.value));
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <Button
            disabled={disableCreateCollectionButton}
            onClick={createAsset}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Create Collection
          </Button>
        </div>

        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Upload Collection Data</CardTitle>
              <CardDescription>
                Uploads collection data to a decentralized storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-between">
                <Input
                  type="file"
                  placeholder="Upload Image"
                  onChange={onUploadFile}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

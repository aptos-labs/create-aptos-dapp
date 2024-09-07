import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient, surfClient } from "@/utils/aptosClient";
import { PetImage, QuestionMarkImage } from "@/components/Pet";
import { Pet, PetParts } from "./Pet";
import { padAddressIfNeeded } from "@/utils/address";
import Confetti from "react-confetti";
import { ABI } from "@/utils/abi";

const getAptogotchiByAddress = async (address: `0x${string}`): Promise<Pet> => {
  return surfClient()
    .view.get_aptogotchi({
      functionArguments: [address],
      typeArguments: [],
    })
    .then((response) => {
      return {
        live: response[0],
        health: response[1],
        parts: response[2] as PetParts,
      };
    });
};

export function Mint() {
  const [myPet, setMyPet] = useState<Pet>();
  const [mintSucceeded, setMintSucceeded] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const { account, network, signAndSubmitTransaction } = useWallet();

  const fetchPet = useCallback(async () => {
    if (!account?.address) return;

    const aptogotchiCollectionAddressResponse = (await aptosClient().view({
      payload: {
        function: `${ABI.address}::aptogotchi::get_aptogotchi_collection_address`,
      },
    })) as [`0x${string}`];

    const collectionAddress = padAddressIfNeeded(
      aptogotchiCollectionAddressResponse[0]
    );

    const myLatestAptogotchiResponse =
      await aptosClient().getAccountOwnedTokensFromCollectionAddress({
        collectionAddress,
        accountAddress: account.address,
        options: {
          limit: 1,
          orderBy: [
            {
              last_transaction_version: "desc",
            },
          ],
        },
      });

    if (myLatestAptogotchiResponse.length === 0) {
      setMyPet(undefined);
    } else {
      setMyPet(
        await getAptogotchiByAddress(
          myLatestAptogotchiResponse[0].token_data_id as `0x${string}`
        )
      );
    }
  }, [account?.address]);

  useEffect(() => {
    if (!account?.address || !network) return;

    fetchPet();
  }, [account?.address, fetchPet, network]);

  const handleMint = async () => {
    if (!account || !network) return;

    setMintSucceeded(false);
    setTransactionInProgress(true);
    setMyPet(undefined);

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${ABI.address}::aptogotchi::create_aptogotchi`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      await aptosClient()
        .waitForTransaction({
          transactionHash: response.hash,
        })
        .then(() => {
          fetchPet();
          setMintSucceeded(true);
        });
    } catch (error: any) {
      console.error(error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md self-center m-4">
      {mintSucceeded && (
        <Confetti recycle={false} numberOfPieces={3000} tweenDuration={15000} />
      )}
      <h2 className="text-xl w-full text-center">Create your pet!</h2>
      <p className="w-full text-center">
        Use on chain randomness to create a random look Aptogotchi.
      </p>
      <div className="flex flex-col gap-6 self-center">
        <div
          className={
            "bg-[hsl(104,40%,75%)] border-double border-8 border-black p-2 relative h-80 w-80"
          }
          style={{ paddingTop: "1rem" }}
        >
          {myPet && !transactionInProgress ? (
            <PetImage petParts={myPet.parts} />
          ) : (
            <QuestionMarkImage />
          )}
        </div>
      </div>
      <button
        type="button"
        className="nes-btn"
        disabled={transactionInProgress}
        onClick={handleMint}
      >
        {transactionInProgress
          ? "Minting..."
          : myPet
            ? "Mint a new Aptogotchi!"
            : "Mint your first Aptogotchi"}
      </button>
      <br />
    </div>
  );
}

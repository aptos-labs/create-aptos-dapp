import { useState } from "react";
import { toast } from "sonner";

import { DEFAULT_PET, PetParts } from "@/app/home/Pet/Pet";
import { ShufflePetImage } from "@/app/home/Pet/ShufflePetImage";
import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/utils/constants";

export interface MintProps {
  fetchPet: () => Promise<void>;
}

export function Mint({ fetchPet }: MintProps) {
  const [name, setName] = useState<string>("");
  const [petParts, setPetParts] = useState<PetParts>(DEFAULT_PET.parts);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const { keylessAccount } = useKeylessAccount();

  const handleMint = async () => {
    if (!keylessAccount) return;

    setTransactionInProgress(true);

    const transaction = await aptosClient().transaction.build.simple({
      sender: keylessAccount.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::main::create_aptogotchi`,
        typeArguments: [],
        functionArguments: [name, petParts.body, petParts.ear, petParts.face],
      },
    });

    try {
      const committedTxn = await aptosClient().signAndSubmitTransaction({
        signer: keylessAccount,
        transaction,
      });
      await aptosClient().waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      toast.success("Your pet was successfully minted!", {
        action: {
          label: "Explorer",
          onClick: () =>
            window.open(
              `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`,
              "_blank"
            ),
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to mint your pet. Please try again.");
    } finally {
      fetchPet();
      setTransactionInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md self-center m-4">
      <h2 className="text-xl w-full text-center">Create your pet!</h2>
      <div className="nes-field w-[320px]">
        <label htmlFor="name_field">Name</label>
        <input
          type="text"
          id="name_field"
          className="nes-input"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
        />
      </div>
      <ShufflePetImage petParts={petParts} setPetParts={setPetParts} />
      <button
        type="button"
        className={`nes-btn ${name ? "is-success" : "is-disabled"}`}
        disabled={!name || transactionInProgress}
        onClick={handleMint}
      >
        {transactionInProgress ? "Loading..." : "Mint Pet"}
      </button>
      <br />
    </div>
  );
}

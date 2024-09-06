"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { usePet } from "@/context/PetContext";
import { aptosClient } from "@/utils/aptosClient";
import {
  ENERGY_CAP,
  ENERGY_DECREASE,
  ENERGY_INCREASE,
  MODULE_ADDRESS,
} from "@/utils/constants";

export type PetAction = "feed" | "play" | "delete";

export interface ActionsProps {
  selectedAction: PetAction;
  setSelectedAction: (action: PetAction) => void;
}

export function Actions({ selectedAction, setSelectedAction }: ActionsProps) {
  const { keylessAccount } = useKeylessAccount();
  const { pet, setPet } = usePet();

  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const handleStart = () => {
    switch (selectedAction) {
      case "feed":
        handleFeed();
        break;
      case "play":
        handlePlay();
        break;
      case "delete":
        handleDelete();
        break;
    }
  };

  const handleFeed = async () => {
    if (!keylessAccount) return;

    setTransactionInProgress(true);

    const transaction = await aptosClient().transaction.build.simple({
      sender: keylessAccount.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::main::feed`,
        typeArguments: [],
        functionArguments: [ENERGY_INCREASE],
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
      toast.success("You successfully fed your pet!", {
        action: {
          label: "Explorer",
          onClick: () =>
            window.open(
              `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`,
              "_blank"
            ),
        },
      });

      setPet((prevPet) => {
        if (!prevPet) return prevPet;

        const newEnergyPoints = prevPet.energy_points + Number(ENERGY_INCREASE);
        if (newEnergyPoints > Number(ENERGY_CAP)) {
          return { ...prevPet };
        }

        return {
          ...prevPet,
          energy_points: newEnergyPoints,
        };
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to feed your pet. Please try again.");
    } finally {
      setTransactionInProgress(false);
    }
  };

  const handlePlay = async () => {
    if (!keylessAccount) return;

    setTransactionInProgress(true);

    const transaction = await aptosClient().transaction.build.simple({
      sender: keylessAccount.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::main::play`,
        typeArguments: [],
        functionArguments: [ENERGY_DECREASE],
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
      toast.success(`Thanks for playing with your pet, ${pet?.name}!`, {
        action: {
          label: "Explorer",
          onClick: () =>
            window.open(
              `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`,
              "_blank"
            ),
        },
      });

      setPet((prevPet) => {
        if (!prevPet) return prevPet;

        const newEnergyPoints = prevPet.energy_points - Number(ENERGY_DECREASE);
        if (newEnergyPoints < 0) {
          return { ...prevPet };
        }

        return {
          ...prevPet,
          energy_points: newEnergyPoints,
        };
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to play with your pet. Please try again.");
    } finally {
      setTransactionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!keylessAccount) return;

    setTransactionInProgress(true);

    const transaction = await aptosClient().transaction.build.simple({
      sender: keylessAccount.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::main::delete`,
        typeArguments: [],
        functionArguments: [],
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
      toast.success("Pet was successfully deleted.", {
        action: {
          label: "Explorer",
          onClick: () =>
            window.open(
              `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`,
              "_blank"
            ),
        },
      });

      setPet(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete your pet. Please try again.");
    } finally {
      setTransactionInProgress(false);
    }
  };

  const feedDisabled =
    selectedAction === "feed" && pet?.energy_points === Number(ENERGY_CAP);
  const playDisabled =
    selectedAction === "play" && pet?.energy_points === Number(0);

  return (
    <div className="nes-container with-title flex-1 bg-white h-[320px]">
      <p className="title">Actions</p>
      <div className="flex flex-col gap-2 justify-between h-full">
        <div className="flex flex-col flex-shrink-0 gap-2 border-b border-gray-300">
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="action"
              checked={selectedAction === "play"}
              onChange={() => {
                setSelectedAction("play");
              }}
            />
            <span>Play</span>
          </label>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="action"
              checked={selectedAction === "feed"}
              onChange={() => {
                setSelectedAction("feed");
              }}
            />
            <span>Feed</span>
          </label>
          {/* <label>
            <input
              type="radio"
              className="nes-radio"
              name="action"
              checked={selectedAction === "delete"}
              onChange={() => setSelectedAction("delete")}
            />
            <span>Delete</span>
          </label> */}
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <p>{actionDescriptions[selectedAction]}</p>
          <button
            type="button"
            className={`nes-btn is-success ${
              feedDisabled || playDisabled ? "is-disabled" : ""
            }`}
            onClick={handleStart}
            disabled={transactionInProgress || feedDisabled || playDisabled}
          >
            {transactionInProgress ? "Processing..." : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

const actionDescriptions: Record<PetAction, string> = {
  feed: "🍔 Feeding your pet will boost its Energy Points...",
  play: "😀 Playing with your pet will make it happy and consume its Energy Points...",
  delete: "😢 Delete your pet... (only used for testing purposes)",
};

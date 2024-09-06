"use client";

import { useCallback, useEffect, useState } from "react";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { usePet } from "@/context/PetContext";
import { surfClient } from "@/utils/aptosClient";

import { Mint } from "./Mint";
import { Pet } from "./Pet/Pet";

export function Connected() {
  const { pet, setPet } = usePet();
  const { keylessAccount } = useKeylessAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const fetchPet = useCallback(async () => {
    if (!keylessAccount?.accountAddress) return;

    setIsLoading(true);

    const hasPet = (
      await surfClient().view.has_aptogotchi({
        typeArguments: [],
        functionArguments: [
          keylessAccount.accountAddress as unknown as `0x${string}`,
        ],
      })
    )[0];

    if (hasPet) {
      let response;

      try {
        response = await surfClient().view.get_aptogotchi({
          typeArguments: [],
          functionArguments: [
            keylessAccount.accountAddress as unknown as `0x${string}`,
          ],
        });

        const [name, birthday, energyPoints, parts] = response;
        const typedParts = parts as { body: number; ear: number; face: number };
        setPet({
          name,
          birthday: parseInt(birthday),
          energy_points: parseInt(energyPoints),
          parts: typedParts,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [keylessAccount?.accountAddress, setPet]);

  useEffect(() => {
    if (!keylessAccount?.accountAddress) return;

    fetchPet();
  }, [keylessAccount?.accountAddress, fetchPet]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return currentProgress + 1;
      });
    }, 25);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3 justify-center items-center">
      {isLoading ? (
        <div className="nes-container with-title">
          <p className="title">Loading...</p>
          <progress
            className="nes-progress is-primary"
            value={progress}
            max="100"
          />
        </div>
      ) : pet ? (
        <Pet />
      ) : (
        <Mint fetchPet={fetchPet} />
      )}
    </div>
  );
}

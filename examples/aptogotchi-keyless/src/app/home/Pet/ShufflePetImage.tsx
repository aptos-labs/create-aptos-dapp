"use client";

import React from "react";

import { ShuffleButton } from "@/components/ShuffleButton";
import { BODY_OPTIONS, EAR_OPTIONS, FACE_OPTIONS } from "@/utils/constants";

import { PetImage } from "./Image";
import { PetParts } from "./Pet";

export function ShufflePetImage({
  petParts,
  setPetParts,
}: {
  petParts: PetParts;
  setPetParts: React.Dispatch<React.SetStateAction<PetParts>>;
}) {
  const handleShuffle = () => {
    const randomPetParts = {
      body: Math.floor(Math.random() * Number(BODY_OPTIONS)),
      ear: Math.floor(Math.random() * Number(EAR_OPTIONS)),
      face: Math.floor(Math.random() * Number(FACE_OPTIONS)),
    };
    setPetParts(randomPetParts);
  };

  return (
    <div className="flex flex-col gap-6 self-center">
      <PetImage petParts={petParts} />
      <ShuffleButton handleShuffle={handleShuffle} />
    </div>
  );
}

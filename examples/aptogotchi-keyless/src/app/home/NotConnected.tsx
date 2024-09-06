"use client";

import React, { useState } from "react";

import { DEFAULT_PET, PetParts } from "@/app/home/Pet/Pet";
import { ShufflePetImage } from "@/app/home/Pet/ShufflePetImage";
import { useTypingEffect } from "@/utils/useTypingEffect";

export function NotConnected() {
  const [petParts, setPetParts] = useState<PetParts>(DEFAULT_PET.parts);

  const text = useTypingEffect(
    `Once you connect your Google account, you'll be able to mint your new on-chain pet.
    Once minted, you'll be able to feed, play with, and customize your new best friend!`
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <ShufflePetImage petParts={petParts} setPetParts={setPetParts} />
      <div className="nes-container is-dark with-title text-sm sm:text-base">
        <p className="title">Welcome</p>
        <p>Welcome to Aptogotchi!</p>
        <p>{text}</p>
      </div>
    </div>
  );
}

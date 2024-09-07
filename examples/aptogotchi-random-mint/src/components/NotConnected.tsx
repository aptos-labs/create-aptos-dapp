"use client";

import { useTypingEffect } from "@/utils/useTypingEffect";

import { QuestionMarkImage } from "@/components/Pet";

export function NotConnected() {
  const text = useTypingEffect(
    `Welcome to Aptogotchi! Once you connect your wallet, you'll be able to mint your new on-chain pet, which uses on chain randomness to determine its look.`
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <QuestionMarkImage />
      <div className="nes-container is-dark with-title">
        <p className="title">Welcome</p>
        <p>{text}</p>
      </div>
    </div>
  );
}

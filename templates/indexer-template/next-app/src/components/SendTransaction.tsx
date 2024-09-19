"use client";

import { PostMessageWithSurf } from "@/components/PostMessageWithSurf";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const SendTransaction = () => {
  const { connected } = useWallet();

  return connected && <PostMessageWithSurf />;
};

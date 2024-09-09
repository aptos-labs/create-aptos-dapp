"use client";

import { useKeylessAccount } from "@/context/KeylessAccountContext";

import { Connected } from "./Connected";
import { NotConnected } from "./NotConnected";

export function Body() {
  const { keylessAccount } = useKeylessAccount();

  if (keylessAccount) return <Connected />;

  return <NotConnected />;
}

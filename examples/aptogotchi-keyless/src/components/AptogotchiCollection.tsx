import React, { useEffect } from "react";

import { useKeylessAccount } from "@/context/KeylessAccountContext";
import { useGetAptogotchiCollection } from "@/hooks/useGetAptogotchiCollection";

export function AptogotchiCollection() {
  const { keylessAccount } = useKeylessAccount();
  const { collection, firstFewAptogotchiName, loading, fetchCollection } =
    useGetAptogotchiCollection();

  useEffect(() => {
    if (!keylessAccount?.accountAddress) return;
    fetchCollection();
  }, [keylessAccount?.accountAddress, fetchCollection]);

  if (loading || !collection) return null;

  return (
    <div className="nes-container with-title sm:h-[100px] mt-4">
      <p>{`There are a total of ${collection.current_supply} Aptogotchis in existence.`}</p>
      <p>{`Meet your fellow Aptogotchis: ${firstFewAptogotchiName?.join(", ")}${
        (firstFewAptogotchiName?.length || 0) < collection.current_supply
          ? "..."
          : ""
      }`}</p>
    </div>
  );
}

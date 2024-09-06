"use client";

import { Account } from "@aptos-labs/ts-sdk";
import React, { createContext, useContext, useState } from "react";

interface KeylessAccountContextType {
  keylessAccount: Account | null;
  setKeylessAccount: (account: Account | null) => void;
}

const KeylessAccountContext = createContext<
  KeylessAccountContextType | undefined
>(undefined);

export const KeylessAccountProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [keylessAccount, setKeylessAccount] = useState<Account | null>(null);

  return (
    <KeylessAccountContext.Provider
      value={{ keylessAccount, setKeylessAccount }}
    >
      {children}
    </KeylessAccountContext.Provider>
  );
};

export const useKeylessAccount = () => {
  const context = useContext(KeylessAccountContext);
  if (!context) {
    throw new Error(
      "useKeylessAccount must be used within a KeylessAccountProvider"
    );
  }
  return context;
};

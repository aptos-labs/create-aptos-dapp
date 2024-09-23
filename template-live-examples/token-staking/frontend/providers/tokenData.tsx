import { getTokenData } from "@/view-functions/getTokenData";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

export interface TokenData {
  decimals: number;
  icon_url: string;
  name: string;
  project_uri: string;
  symbol: string;
}

export interface TokenDataProviderState {
  tokenData?: TokenData | null;
}

const defaultValues: TokenDataProviderState = {
  tokenData: undefined,
};

export const TokenDataContext = createContext<TokenDataProviderState>(defaultValues);

export const TokenDataContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>();

  useEffect(() => {
    async function getOnChainTokenData() {
      const toeknData = await getTokenData();

      setTokenData(toeknData);
    }

    getOnChainTokenData();
  }, []);

  return <TokenDataContext.Provider value={{ tokenData }}>{children}</TokenDataContext.Provider>;
};

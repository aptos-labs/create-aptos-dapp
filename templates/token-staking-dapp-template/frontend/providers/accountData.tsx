import { useToast } from "@/components/ui/use-toast";
import { useGetTokenData } from "@/hooks/useGetTokenData";
import { convertAmountFromOnChainToHumanReadable } from "@/utils/helpers";
import { getAccountTokenBalance } from "@/view-functions/getAccountTokenAmount";
import { getClaimableRewards } from "@/view-functions/getClaimableRewards";
import { getUserHasStake } from "@/view-functions/getUserHasStake";
import { getUserStakeData } from "@/view-functions/getUserStakeData";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

export interface AccountDataDataProviderState {
  hasStake: boolean;
  hasRewards: boolean;
  claimableRewards: number;
  accountStakeAmount: number;
  isCreator: boolean;
  accountTokenBalance: string;
}

const defaultValues: AccountDataDataProviderState = {
  hasStake: false,
  hasRewards: false,
  claimableRewards: 0,
  accountStakeAmount: 0,
  isCreator: false,
  accountTokenBalance: "0",
};

export const AccountDataContext = createContext<AccountDataDataProviderState>(defaultValues);

export const AccountDataContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { account } = useWallet();
  const { tokenData } = useGetTokenData();
  const { toast } = useToast();

  const [hasStake, setHasStake] = useState<boolean>(false);
  const [hasRewards, setHasRewards] = useState<boolean>(false);
  const [claimableRewards, setClaimableRewards] = useState<number>(0);
  const [accountStakeAmount, setAccountStakeAmount] = useState<number>(0);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [accountTokenBalance, setAccountTokenBalance] = useState<string>("0");

  const { data } = useQuery({
    queryKey: ["account-data-context", account],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        /**
         * Get the current connected account claimable rewards
         */
        const claimableRewards = await getClaimableRewards(account?.address);

        /**
         * Determine whether the current connected account has staked
         */
        const hasStake = await getUserHasStake(account?.address);

        /**
         * Get the current connected account stake data
         */
        const accountStakeData = await getUserStakeData(account?.address);

        const accountStakedAmount = convertAmountFromOnChainToHumanReadable(
          parseInt(accountStakeData?.amount ?? "0"),
          tokenData?.decimals ?? 0,
        );

        /**
         * Define whether the current connected account is the stake creator
         */
        const isCreator = account?.address === import.meta.env.VITE_CREATOR_ADDRESS;

        /**
         * Get the TOKEN balance of an Account
         *
         * The token amount is represnted is the smallest unit on chain. i.e if an account balance is 500
         * and the token decimals is 2, then the account token balance is represnted as 50000 (500 as the balance and
         * 00 as the decimals).
         *
         * This query first fetch the account token balance, then the token decimals and calculates
         * the account balance and converts it into a human readable format.
         */
        const onChainBalance = await getAccountTokenBalance(account?.address);
        const tokenBalance = convertAmountFromOnChainToHumanReadable(
          onChainBalance,
          tokenData?.decimals ?? 0,
        ).toLocaleString(undefined, {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        });

        return { claimableRewards, hasStake, accountStakedAmount, isCreator, tokenBalance };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    },
  });

  useEffect(() => {
    if (data) {
      setClaimableRewards(data.claimableRewards);
      setHasRewards(data.claimableRewards > 0);
      setHasStake(data.hasStake);
      setAccountStakeAmount(data.accountStakedAmount);
      setIsCreator(data.isCreator);
      setAccountTokenBalance(data.tokenBalance);
    }
  }, [data]);

  return (
    <AccountDataContext.Provider
      value={{ accountTokenBalance, hasStake, hasRewards, claimableRewards, accountStakeAmount, isCreator }}
    >
      {children}
    </AccountDataContext.Provider>
  );
};

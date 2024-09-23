import { useToast } from "@/components/ui/use-toast";
import { REWARD_CREATOR_ADDRESS } from "@/constants";
import { useGetStakePoolData } from "@/hooks/useGetStakePoolData";
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
  const { existsRewardSchedule } = useGetStakePoolData();

  const [hasStake, setHasStake] = useState<boolean>(false);
  const [hasRewards, setHasRewards] = useState<boolean>(false);
  const [claimableRewards, setClaimableRewards] = useState<number>(0);
  const [accountStakeAmount, setAccountStakeAmount] = useState<number>(0);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [accountTokenBalance, setAccountTokenBalance] = useState<string>("0");

  const { data } = useQuery({
    queryKey: ["account-data-context", account, existsRewardSchedule],
    refetchInterval: 1000 * 30,
    queryFn: async () => {
      try {
        if (!account) return defaultValues;
        /**
         * Get the current connected account claimable rewards
         */
        let claimableRewards = 0;
        if (existsRewardSchedule) {
          claimableRewards = await getClaimableRewards(account?.address);
        }

        /**
         * Determine whether the current connected account has staked
         */
        const hasStake = await getUserHasStake(account?.address);

        /**
         * Get the current connected account stake data
         */
        let accountStakeData;
        let accountStakeAmount = 0;
        if (hasStake) {
          accountStakeData = await getUserStakeData(account?.address);

          accountStakeAmount = convertAmountFromOnChainToHumanReadable(
            parseInt(accountStakeData?.amount ?? "0"),
            tokenData?.decimals ?? 0,
          );
        }

        /**
         * Define whether the current connected account is the stake creator
         */
        const isCreator = REWARD_CREATOR_ADDRESS && account?.address === REWARD_CREATOR_ADDRESS;
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
        const accountTokenBalance = convertAmountFromOnChainToHumanReadable(
          onChainBalance,
          tokenData?.decimals ?? 0,
        ).toLocaleString(undefined, {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        });

        return { claimableRewards, hasStake, accountStakeAmount, isCreator, accountTokenBalance };
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
      setAccountStakeAmount(data.accountStakeAmount);
      setIsCreator(data.isCreator);
      setAccountTokenBalance(data.accountTokenBalance);
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

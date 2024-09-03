import { aptosClient } from "@/utils/aptosClient";
import { COIN_ABI } from "@/utils/coin_abi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { toast } from "sonner";

export type TransferAPTArguments = {
  to: `0x${string}`;
  amount: number;
};

export const useTransferCoin = () => {
  const { client } = useWalletClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, amount }: TransferAPTArguments) => {
      if (!client) throw new Error("Wallet client not available");
      const result = await client.useABI(COIN_ABI).transfer({
        arguments: [to, BigInt(amount)],
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
      });
      return result.hash;
    },
    onSuccess: async (hash) => {
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: hash,
      });

      queryClient.invalidateQueries();
      toast("Transaction sent", {
        action: {
          label: "Open",
          onClick: () =>
            window.open(
              `https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=${process.env.NEXT_PUBLIC_APP_NETWORK}`,
              "_blank",
            ),
        },
      });
    },
  });
};

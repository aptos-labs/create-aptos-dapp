import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Internal components
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getCounter } from "@/view-functions/getCounter";
import { click } from "@/entry-functions/click";

export function Counter() {
  const [counter, setCounter] = useState<number>(0);
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["counter", account?.address],
    refetchInterval: 10_000,
    queryFn: async () => {
      if (!account) {
        return {
          counter: 0,
        };
      }
      try {
        const counter = await getCounter(account.address.toStringLong());
        return {
          counter,
        };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return {
          counter: 0,
        };
      }
    },
  });

  const onClickButton = async () => {
    if (!account) {
      console.error("Account or wallet client not available");
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(click());
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (data) {
      setCounter(data.counter);
    }
  }, [data]);

  return connected ? (
    <Card>
      <CardContent className="flex flex-col gap-10 pt-6">
        <div className="flex flex-col gap-6">
          <h4 className="text-lg font-medium">Counter {counter}</h4>
          <Button onClick={onClickButton}>Increment counter</Button>
        </div>
      </CardContent>
    </Card>
  ) : (
    <CardHeader>
      <CardTitle>To get started Connect a wallet</CardTitle>
    </CardHeader>
  );
}

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Internal components
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMizuWallet } from "@/components/WalletProvider";
import { getCounter } from "@/view-functions/getCounter";
import { MODULE_ADDRESS } from "@/constants";

export function Counter() {
  const [counter, setCounter] = useState<number>(0);
  const { mizuClient, userAddress } = useMizuWallet();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["counter", userAddress],
    refetchInterval: 10_000,
    queryFn: async () => {
      if (!userAddress) {
        return {
          counter: 0,
        };
      }
      const counter = await getCounter(userAddress);
      return {
        counter,
      };
    },
  });

  const onClickButton = async () => {
    if (!mizuClient) {
      console.error("Account or wallet client not available");
      return;
    }

    try {
      const orderId = await mizuClient.createOrder({
        payload: {
          function: `${MODULE_ADDRESS}::counter_app::click`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      console.log("confirming order", orderId);
      await mizuClient.confirmOrder({
        orderId,
      });
      toast({
        title: "Success",
        description: `Transaction submitted, mizu order ID: ${orderId}`,
      });
      console.log("waiting for order", orderId);
      await mizuClient.waitForOrder({
        orderId,
      });
      console.log("fetching order", orderId);
      const order = await mizuClient.fetchOrder({
        id: orderId,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${order.hash}`,
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

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">Counter {counter}</h4>
      <Button onClick={onClickButton}>Increment counter</Button>
    </div>
  );
}

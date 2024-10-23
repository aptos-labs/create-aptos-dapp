import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMessageContent } from "@/view-functions/getMessageContent";
import { writeMessage } from "@/entry-functions/writeMessage";
import { WarningAlert } from "./ui/warning-alert";

export function MessageBoard() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [messageContent, setMessageContent] = useState<string>();
  const [newMessageContent, setNewMessageContent] = useState<string>();

  const { data } = useQuery({
    queryKey: ["message-content", account?.address],
    refetchInterval: 10_000,
    queryFn: async () => {
      try {
        const content = await getMessageContent();

        return {
          content,
        };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return {
          content: "",
        };
      }
    },
  });

  const onClickButton = async () => {
    if (!account || !newMessageContent) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(
        writeMessage({
          content: newMessageContent,
        }),
      );
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
      setMessageContent(data.content);
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">Message content: {messageContent}</h4>
      New message{" "}
      <Input disabled={!account} placeholder="yoho" onChange={(e) => setNewMessageContent(e.target.value)} />
      <Button disabled onClick={onClickButton}>
        Write
      </Button>
      <WarningAlert title="Collection ID not set">
        Use the{" "}
        <a
          target="blank"
          href="https://learn.aptoslabs.com/en/dapp-templates/boilerplate-template"
          style={{ textDecoration: "underline" }}
        >
          create-aptos-dapp boilerplate template
        </a>{" "}
        to use this functionality
      </WarningAlert>
    </div>
  );
}

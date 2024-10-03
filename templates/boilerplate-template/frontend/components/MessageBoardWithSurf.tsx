import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletClient } from "@thalalabs/surf/hooks";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMessageContent } from "@/view-functions/getMessageContent";
import { MESSAGE_BOARD_ABI } from "@/utils/message_board_abi";

export function MessageBoard() {
  const { client } = useWalletClient();

  const queryClient = useQueryClient();

  const [messageContent, setMessageContent] = useState<string>();
  const [newMessageContent, setNewMessageContent] = useState<string>();

  const { data } = useQuery({
    queryKey: ["message-content"],
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
    if (!newMessageContent || !client) {
      return;
    }

    try {
      const committedTransaction = await client.useABI(MESSAGE_BOARD_ABI).post_message({
        type_arguments: [],
        arguments: [newMessageContent],
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries({
        queryKey: ["message-content"],
      });
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
      New message <Input disabled={!client} placeholder="yoho" onChange={(e) => setNewMessageContent(e.target.value)} />
      <Button
        disabled={!client || !newMessageContent || newMessageContent.length === 0 || newMessageContent.length > 100}
        onClick={onClickButton}
      >
        Write
      </Button>
    </div>
  );
}

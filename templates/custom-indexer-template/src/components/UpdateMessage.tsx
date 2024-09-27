"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { updateMessage } from "@/entry-functions/updateMessage";

const FormSchema = z.object({
  stringContent: z.string(),
});

type UpdateMessageProps = {
  messageObjAddr: `0x${string}`;
};

export function UpdateMessage({ messageObjAddr }: UpdateMessageProps) {
  const { toast } = useToast();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      stringContent: "Updated content",
    },
  });

  const onSignAndSubmitTransaction = async (
    data: z.infer<typeof FormSchema>
  ) => {
    if (!account) {
      console.error("Wallet not available");
      return;
    }

    signAndSubmitTransaction(
      updateMessage({
        messageObj: messageObjAddr,
        content: data.stringContent,
      })
    )
      .then((committedTransaction) => {
        return getAptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
      })
      .then((executedTransaction) => {
        toast({
          title: "Success",
          description: (
            <TransactionOnExplorer hash={executedTransaction.hash} />
          ),
        });
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .then(() => {
        return queryClient.invalidateQueries({ queryKey: [messageObjAddr] });
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to create a message",
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update message content</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSignAndSubmitTransaction)}
            className="flex flex-col justify-between gap-4 w-1/2"
          >
            <FormField
              control={form.control}
              name="stringContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>String Content</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Store a string content</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!connected}
              className="w-40 self-start col-span-2"
            >
              Update
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

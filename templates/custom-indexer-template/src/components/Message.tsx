"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { NETWORK } from "@/lib/aptos";
import { getMessageOnServer } from "@/app/actions";
import { UpdateMessage } from "./UpdateMessage";

interface MessageProps {
  messageObjAddr: `0x${string}`;
}

export function Message({ messageObjAddr }: MessageProps) {
  const { account } = useWallet();

  const fetchData = async () => {
    return await getMessageOnServer({
      messageObjAddr,
    });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [messageObjAddr],
    queryFn: fetchData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Message not found</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 pt-6">
          <div className="flex flex-col gap-6">
            <LabelValueGrid
              items={[
                {
                  label: "Message object address",
                  value: (
                    <p>
                      <a
                        href={`https://explorer.aptoslabs.com/object/${data.message.message_obj_addr}?network=${NETWORK}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-300"
                      >
                        {data.message.message_obj_addr}
                      </a>
                    </p>
                  ),
                },
                {
                  label: "Creator address",
                  value: (
                    <p>
                      <a
                        href={`https://explorer.aptoslabs.com/account/${data.message.creator_addr}?network=${NETWORK}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-300"
                      >
                        {data.message.creator_addr}
                      </a>
                    </p>
                  ),
                },
                {
                  label: "Creation timestamp",
                  value: (
                    <p>
                      {new Date(
                        data.message.creation_timestamp * 1000
                      ).toLocaleString()}
                    </p>
                  ),
                },
                {
                  label: "Last update timestamp",
                  value: (
                    <p>
                      {new Date(
                        data.message.last_update_timestamp * 1000
                      ).toLocaleString()}
                    </p>
                  ),
                },
                {
                  label: "Content",
                  value: <p>{data.message.content}</p>,
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
      {data.message.creator_addr == account?.address && (
        <UpdateMessage
          messageObjAddr={data.message.message_obj_addr as `0x${string}`}
        />
      )}
    </div>
  );
}

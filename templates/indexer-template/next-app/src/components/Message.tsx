"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { NETWORK } from "@/lib/aptos";
import { useEffect, useState } from "react";
import { MessageOnUi } from "@/lib/type/message";
import { getMessageOnServer } from "@/app/actions";

interface MessageProps {
  messageObjAddr: `0x${string}`;
}

export function Message({ messageObjAddr }: MessageProps) {
  const [message, setMessage] = useState<MessageOnUi>();

  useEffect(() => {
    getMessageOnServer({ messageObjAddr }).then(({ message }) => {
      setMessage(message);
    });
  }, [messageObjAddr]);

  if (!message) {
    return <>Loading...</>;
  }

  return (
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
                      href={`https://explorer.aptoslabs.com/object/${message.message_obj_addr}?network=${NETWORK}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-300"
                    >
                      {message.message_obj_addr}
                    </a>
                  </p>
                ),
              },
              {
                label: "Creator address",
                value: (
                  <p>
                    <a
                      href={`https://explorer.aptoslabs.com/account/${message.creator_addr}?network=${NETWORK}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-300"
                    >
                      {message.creator_addr}
                    </a>
                  </p>
                ),
              },
              {
                label: "Creation timestamp",
                value: (
                  <p>
                    {new Date(
                      message.creation_timestamp * 1000
                    ).toLocaleString()}
                  </p>
                ),
              },
              {
                label: "Last update timestamp",
                value: (
                  <p>
                    {new Date(
                      message.last_update_timestamp * 1000
                    ).toLocaleString()}
                  </p>
                ),
              },
              {
                label: "Content",
                value: <p>{message.content}</p>,
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

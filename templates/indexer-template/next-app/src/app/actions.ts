"use server";

import { getLastSuccessVersion } from "@/db/getLastSuccessVersion";
import { GetMessageProps, getMessage } from "@/db/getMessage";
import { GetMessagesProps, getMessages } from "@/db/getMessages";
import { MessageBoardColumns, MessageOnUi } from "@/lib/type/message";

export const getMessagesOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetMessagesProps): Promise<{
  messages: MessageBoardColumns[];
  totalMessages: number;
}> => {
  return getMessages({ page, limit, sortedBy, order });
};

export const getMessageOnServer = async ({
  messageObjAddr,
}: GetMessageProps): Promise<{
  message: MessageOnUi;
}> => {
  return getMessage({ messageObjAddr });
};

export const getLastVersionOnServer = async (): Promise<number> => {
  return getLastSuccessVersion();
};

import { Message } from "@/components/Message";

export default function MessagePage({
  params,
}: {
  params: { messageObjAddr: `0x${string}` };
}) {
  const { messageObjAddr } = params;

  return <Message messageObjAddr={messageObjAddr} />;
}

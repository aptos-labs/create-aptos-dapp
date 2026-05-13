import { Message } from "@/components/Message";

export default async function MessagePage({ params }: { params: Promise<{ messageObjAddr: `0x${string}` }> }) {
  const { messageObjAddr } = await params;

  return <Message messageObjAddr={messageObjAddr} />;
}

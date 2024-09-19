import { MessageBoard } from "@/components/MessageBoard";
import { SendTransaction } from "@/components/SendTransaction";

export default function HomePage() {
  return (
    <>
      <MessageBoard />
      <SendTransaction />
    </>
  );
}

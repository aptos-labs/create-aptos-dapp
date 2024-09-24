import { MessageBoard } from "@/components/MessageBoard";
import { CreateMessage } from "@/components/CreateMessage";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <MessageBoard />
      <CreateMessage />
    </div>
  );
}

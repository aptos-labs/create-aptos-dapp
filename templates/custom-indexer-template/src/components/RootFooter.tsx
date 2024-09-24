import { IndexerStatus } from "@/components/IndexerStatus";

export const RootFooter = () => {
  return (
    <div className="flex items-center justify-center gap-6 pb-5">
      <IndexerStatus />
    </div>
  );
};

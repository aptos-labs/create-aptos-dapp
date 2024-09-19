"use client";

import { useQuery } from "@tanstack/react-query";

import { getLastVersionOnServer } from "@/app/actions";
import { getAptosClient } from "@/lib/aptos";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const IndexerStatus = () => {
  const fetchData = async () => {
    const indexerLastVersion = await getLastVersionOnServer();
    const latestBlockHeight = await getAptosClient().view<[number]>({
      payload: {
        function: "0x1::block::get_current_block_height",
        typeArguments: [],
        functionArguments: [],
      },
    });
    const block = await getAptosClient().getBlockByHeight({
      blockHeight: latestBlockHeight[0],
    });
    const onChainLastVersion = parseInt(block.last_version);
    return {
      indexerLastVersion,
      onChainLastVersion,
    };
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["last-version"],
    queryFn: fetchData,
    refetchInterval: 3000,
  });

  if (isLoading || !data) {
    return <div>Loading last indexer version</div>;
  }

  if (isError) {
    return <div>Error getting last indexer version: {error.message}</div>;
  }

  const versionDiff = data.onChainLastVersion - data.indexerLastVersion;
  const isHealthy = versionDiff < 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center justify-center">
            {isHealthy ? "Indexer up to date" : "Indexer lagging"}
            <div
              className={`w-3 h-3 rounded-full ml-2 ${
                isHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>Indexer Version: {data.indexerLastVersion}</p>
            <p>On-Chain Version: {data.onChainLastVersion}</p>
            <p>Difference: {versionDiff}</p>
            <p>
              When the difference is greater than 100, the indexer is considered
              lagging.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

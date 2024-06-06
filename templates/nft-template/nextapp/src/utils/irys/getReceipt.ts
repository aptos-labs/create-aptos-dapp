import Query from "@irys/query";

interface UploadReceipt {
  version: string;
  id: string;
  timestamp: number;
  signature: string;
  deadlineHeight: number;
}

async function getReceipt(txId: string): Promise<UploadReceipt> {
  try {
    const network = "devnet";

    const myQuery = new Query({ network });
    const queryResults = await myQuery.search("irys:transactions");

    const receipt = {
      version: "1.0.0",
      id: txId,
      timestamp: queryResults[0].receipt.timestamp,
      signature: queryResults[0].receipt.signature,
      deadlineHeight: queryResults[0].receipt.deadlineHeight,
    };

    return receipt;
  } catch (e) {
    return {
      version: "1.0.0",
      id: "",
      timestamp: 0,
      signature: "",
      deadlineHeight: 0,
    };
  }
}

export default getReceipt;

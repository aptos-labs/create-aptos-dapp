import { NETWORK } from "@/constants";

export interface TransactionOnExplorerProps {
  hash: string;
}

export function TransactionOnExplorer({ hash }: TransactionOnExplorerProps) {
  const explorerLink = `https://explorer.aptoslabs.com/txn/${hash}${`?network=${NETWORK}`}`;
  return (
    <>
      View on Explorer:{" "}
      <a
        href={explorerLink}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 dark:text-blue-300"
      >
        {explorerLink}
      </a>
    </>
  );
}

export interface ObjectOnExplorerProps {
  address: string;
}

export function ObjectOnExplorer({ address }: ObjectOnExplorerProps) {
  const explorerLink = `https://explorer.aptoslabs.com/object/${address}${`?network=${NETWORK}`}`;
  return (
    <a
      href={explorerLink}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 dark:text-blue-300"
    >
      View on Explorer
    </a>
  );
}

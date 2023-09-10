import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createClient } from "@thalalabs/surf";
import { Spin } from "antd";
import { Provider } from "aptos";
import { useState, useCallback, useEffect } from "react";
import { ABI } from "../abi";
import { provider } from "../App";
import { Task } from "../utils/types";
import ListView from "../views/ListView";
import NoListView from "../views/NoListView";

export default function Content() {
  // local safe-type generator client to interact with move modules
  const client = createClient({
    nodeUrl: provider.aptosClient.nodeUrl,
  }).useABI(ABI);

  const [tasks, setTasks] = useState<Task[]>([]);

  const { account } = useWallet();
  const accountAddr: `0x${string}` | null = account
    ? account.address.startsWith("0x")
      ? (account.address as `0x${string}`)
      : `0x${account.address}`
    : null;
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const fetchList = useCallback(async () => {
    if (!accountAddr) return [];
    try {
      const todoListResource = await client.resource.TodoList({
        type_arguments: [],
        account: accountAddr,
      });
      setAccountHasList(true);
      setTasks(todoListResource.data.tasks as Task[]);
    } catch (e: any) {
      setAccountHasList(false);
    }
  }, [accountAddr]);

  useEffect(() => {
    fetchList();
  }, [account?.address, fetchList]);

  return (
    <Spin spinning={transactionInProgress}>
      {!accountHasList ? (
        <NoListView
          setTransactionInProgress={setTransactionInProgress}
          setAccountHasList={setAccountHasList}
        />
      ) : (
        <ListView
          setTransactionInProgress={setTransactionInProgress}
          tasks={tasks}
          setTasks={setTasks}
        />
      )}
    </Spin>
  );
}

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { aptos } from "../utils/consts";
import { Task } from "../utils/types";
import ListView from "../views/ListView";
import NoListView from "../views/NoListView";
import { ABI } from "../abi";

export default function Content() {
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
      const todoListResource = await aptos.getAccountResource({
        accountAddress: accountAddr,
        resourceType: `${ABI.address}::todolist::TodoList`,
      });
      setAccountHasList(true);
      setTasks(todoListResource.tasks as Task[]);
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

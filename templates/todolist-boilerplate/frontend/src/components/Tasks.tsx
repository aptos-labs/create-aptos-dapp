import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { List, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { ABI } from "../abi";
import { provider } from "../App";
import { Task } from "../utils/types";
import { useAlert } from "./alertProvider";

type TasksProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function Tasks({
  setTransactionInProgress,
  tasks,
  setTasks,
}: TasksProps) {
  const { account, network, signAndSubmitTransaction } = useWallet();
  // global alert state
  const { setSuccessAlertHash } = useAlert();

  const onCheckboxChange = async (
    event: CheckboxChangeEvent,
    taskId: number
  ) => {
    if (!account) return;
    if (!event.target.checked) return;
    setTransactionInProgress(true);
    const payload = {
      type: "entry_function_payload",
      ...createEntryPayload(ABI, {
        function: "complete_task",
        type_arguments: [],
        arguments: [taskId],
      }).rawPayload,
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(payload);
      // wait for transaction
      await provider.waitForTransaction(response.hash);
      setSuccessAlertHash(response.hash, network?.name);
      setTasks((prevState) => {
        const newState = prevState.map((obj, idx) => {
          // if task_id equals the checked taskId, update completed property
          if (idx === taskId) {
            return { ...obj, completed: true };
          }

          // otherwise return object as is
          return obj;
        });

        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <List
      size="small"
      bordered
      dataSource={tasks}
      renderItem={(task: Task, idx) => (
        <List.Item
          actions={[
            <div>
              {task.completed ? (
                <Checkbox defaultChecked={true} disabled />
              ) : (
                <Checkbox onChange={(event) => onCheckboxChange(event, idx)} />
              )}
            </div>,
          ]}
        >
          <List.Item.Meta
            title={task.content}
            description={
              <a
                href={`https://explorer.aptoslabs.com/account/${task.address}/`}
                target="_blank"
                rel="noreferrer"
              >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a>
            }
          />
        </List.Item>
      )}
    />
  );
}

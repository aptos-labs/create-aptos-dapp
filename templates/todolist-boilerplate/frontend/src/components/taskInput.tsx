import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { Button, Col, Input } from "antd";
import { useState } from "react";
import { ABI } from "../abi";
import { provider } from "../App";
import { Task } from "../utils/types";
import { useAlert } from "./alertProvider";

type TaskInputProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function TaskInput({
  setTransactionInProgress,
  tasks,
  setTasks,
}: TaskInputProps) {
  const [newTask, setNewTask] = useState<string>("");
  const { account, network, signAndSubmitTransaction } = useWallet();
  const { setSuccessAlertHash } = useAlert();

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    // build a transaction payload to be submited
    const payload = {
      type: "entry_function_payload",
      ...createEntryPayload(ABI, {
        function: "create_task",
        type_arguments: [],
        arguments: [newTask],
      }).rawPayload,
    };

    // hold the latest task.task_id from our local state

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(payload);
      // wait for transaction
      await provider.waitForTransaction(response.hash);
      setSuccessAlertHash(response.hash, network?.name);
      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <Col span={8} offset={8}>
      <Input.Group compact>
        <Input
          onChange={(event) => onWriteTask(event)}
          style={{ width: "calc(100% - 60px)" }}
          placeholder="Add a Task"
          size="large"
          value={newTask}
        />
        <Button
          onClick={onTaskAdded}
          type="primary"
          style={{ height: "40px", backgroundColor: "#3f67ff" }}
        >
          Add
        </Button>
      </Input.Group>
    </Col>
  );
}

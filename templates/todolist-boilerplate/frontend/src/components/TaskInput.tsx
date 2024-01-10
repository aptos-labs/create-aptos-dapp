import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Col, Input, Button } from "antd";
import { useState } from "react";
import { useAlert } from "../hooks/alertProvider";
import { provider } from "../utils/consts";
import { Task } from "../utils/types";

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
    // hold the latest task.task_id from our local state

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction({
        type: "entry_function_payload",
        function: `${
          import.meta.env.VITE_MODULE_ADDRESS
        }::todolist::create_task`,
        type_arguments: [],
        arguments: [newTask],
      });
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

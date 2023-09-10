import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { Row, Col, Input, Button, List, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useState } from "react";
import { ABI } from "../abi";
import TaskInput from "../components/TaskInput";
import Tasks from "../components/Tasks";
import { useAlert } from "../hooks/alertProvider";
import { provider, network } from "../utils/consts";
import { Task } from "../utils/types";

type ListViewProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function ListView({
  setTransactionInProgress,
  tasks,
  setTasks,
}: ListViewProps) {
  return (
    <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
      <TaskInput
        setTransactionInProgress={setTransactionInProgress}
        tasks={tasks}
        setTasks={setTasks}
      />
      <Tasks
        setTransactionInProgress={setTransactionInProgress}
        tasks={tasks}
        setTasks={setTasks}
      />
    </Row>
  );
}

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Col, List, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useAlert } from "../hooks/alertProvider";
import { provider } from "../utils/consts";
import { Task } from "../utils/types";

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
  const { setSuccessAlertHash } = useAlert();

  const onCheckboxChange = async (
    event: CheckboxChangeEvent,
    taskId: number
  ) => {
    if (!account) return;
    if (!event.target.checked) return;
    setTransactionInProgress(true);

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction({
        type: "entry_function_payload",
        function: `${
          import.meta.env.VITE_MODULE_ADDRESS
        }::todolist::complete_task`,
        type_arguments: [],
        arguments: [taskId],
      });
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
    <Col span={8} offset={8}>
      {tasks && (
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
                    <Checkbox
                      onChange={(event) => onCheckboxChange(event, idx)}
                    />
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
                  >{`${task.address.slice(0, 6)}...${task.address.slice(
                    -5
                  )}`}</a>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Col>
  );
}

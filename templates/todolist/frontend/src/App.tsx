import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";

import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Network, Provider } from "aptos";
import { createClient, createEntryPayload } from "@thalalabs/surf";
import { ABI } from "./abi";
import { useAlert } from "./components/alertProvider";

type Task = {
  address: string;
  completed: boolean;
  content: string;
};

let network =
  import.meta.env.VITE_APP_NETWORK === "devnet"
    ? Network.DEVNET
    : import.meta.env.VITE_APP_NETWORK === "testnet"
    ? Network.TESTNET
    : import.meta.env.VITE_APP_NETWORK === "mainnet"
    ? Network.MAINNET
    : Network.LOCAL;

export const provider = new Provider(network);
const client = createClient({
  nodeUrl: provider.aptosClient.nodeUrl,
}).useABI(ABI);

function App() {
  const { setSuccessAlertHash } = useAlert();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const { account, network, signAndSubmitTransaction } = useWallet();
  const accountAddr: `0x${string}` | null = account
    ? account.address.startsWith("0x")
      ? (account.address as `0x${string}`)
      : `0x${account.address}`
    : null;
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

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

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    // build a transaction payload to be submited
    const payload = {
      type: "entry_function_payload",
      ...createEntryPayload(ABI, {
        function: "create_list",
        type_arguments: [],
        arguments: [],
      }).rawPayload,
    };
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(payload);
      // wait for transaction
      await provider.waitForTransaction(response.hash);
      setAccountHasList(true);
      setSuccessAlertHash(response.hash, network?.name);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
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

  useEffect(() => {
    fetchList();
  }, [account?.address, fetchList]);

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>My todolist</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={addNewList}
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
              >
                Add new list
              </Button>
            </Col>
            <Col span={8} offset={10}>
              {!account && <h3>Connect a wallet to create a new list</h3>}
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
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
          </Row>
        )}
      </Spin>
    </>
  );
}

export default App;

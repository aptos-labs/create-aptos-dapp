import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { Row, Col, Button } from "antd";
import { ABI } from "../abi";
import { useAlert } from "../hooks/alertProvider";
import { provider, network } from "../utils/consts";

type NoListViewProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountHasList: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NoListView({
  setTransactionInProgress,
  setAccountHasList,
}: NoListViewProps) {
  const { account, network, signAndSubmitTransaction } = useWallet();
  const { setSuccessAlertHash } = useAlert();

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

  return (
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
  );
}

import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Layout, Row, Col } from "antd";

export default function Header() {
  return (
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
  );
}

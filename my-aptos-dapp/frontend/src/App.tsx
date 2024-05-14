import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Irys from "./irys";

function App() {
  return (
    <>
      <div className="navbar">
        <div className="navbar-text">Create Aptos Dapp</div>
        <div>
          <WalletSelector />
        </div>
      </div>
      <div className="center-container">
        <Irys />
      </div>
    </>
  );
}

export default App;

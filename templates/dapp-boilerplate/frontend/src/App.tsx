import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import logo from "./assets/aptos.png";

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
        <img className="center-image" src={logo} alt="aptos" />
      </div>
    </>
  );
}

export default App;

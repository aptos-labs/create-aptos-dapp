import { Provider } from "aptos";
// wallet adapter
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
// wallets
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { MSafeWalletAdapter } from "msafe-plugin-wallet-adapter";
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { OpenBlockWallet } from "@openblockhq/aptos-wallet-adapter";
import { TokenPocketWallet } from "@tp-lab/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";

import Header from "./components/Header";
import Content from "./components/Content";
import { network } from "./utils/consts";
import { useAlert } from "./components/alertProvider";

export const provider = new Provider(network);

const wallets = [
  new PetraWallet(),
  new PontemWallet(),
  new RiseWallet(),
  new FewchaWallet(),
  new MartianWallet(),
  new MSafeWalletAdapter(),
  new NightlyWallet(),
  new OpenBlockWallet(),
  new TokenPocketWallet(),
  new TrustWallet(),
  new WelldoneWallet(),
];

function App() {
  const { setErrorAlertMessage } = useAlert();
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      onError={(error) => {
        console.log("Custom error handling", error);
        setErrorAlertMessage(error);
      }}
    >
      <Header />
      <Content />
    </AptosWalletAdapterProvider>
  );
}

export default App;

import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Header } from "@/components/Header";

function App() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <div className="card">
            <h1>Hello World</h1>
          </div>
        ) : (
          <div className="card">
            <h1>To get started Connect a wallet</h1>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

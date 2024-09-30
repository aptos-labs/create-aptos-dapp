// Internal Components
import { Header } from "@/components/Header";
import { Stake } from "./pages/Stake";
import { TopBanner } from "./components/TopBanner";
import { IS_DEV } from "./constants";

function App() {
  return (
    <>
      {IS_DEV && <TopBanner />}
      <Header />
      <Stake />
    </>
  );
}

export default App;

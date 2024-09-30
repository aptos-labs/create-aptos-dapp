import { Header } from "@/components/Header";
import { Counter } from "@/components/Counter";
import { TopBanner } from "@/components/TopBanner";

import { IS_DEV } from "./constants";

function App() {
  return (
    <>
      {IS_DEV && <TopBanner />}
      <Header />
      <div className="flex items-center justify-center flex-col">
        <Counter />
      </div>
    </>
  );
}

export default App;

import { Header } from "@/components/Header";
import { Counter } from "@/components/Counter";

function App() {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        <Counter />
      </div>
    </>
  );
}

export default App;

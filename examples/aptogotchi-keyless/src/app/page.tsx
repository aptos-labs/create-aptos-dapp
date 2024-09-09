import ClientOnly from "@/components/ClientOnly";
import { WalletButtons } from "@/components/WalletButtons";

import { Body } from "./home/Body";

export default function Home() {
  return (
    <div className="flex sm:justify-center sm:items-center sm:h-screen sm:overflow-hidden">
      <div className="w-screen sm:w-[1200px] sm:h-[800px] sm:m-auto border-4 border-black border-solid">
        <Header />
        <Body />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="md:sticky top-0 z-10 flex justify-between items-center md:px-6 py-4 bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 shadow-md w-full gap-2">
      <h1 className="text-2xl hidden sm:block">Aptogotchi</h1>
      <ClientOnly>
        <WalletButtons />
      </ClientOnly>
    </header>
  );
}

import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { OurStorySection } from "./components/OurStorySection";
import { useMintData } from "./hooks/useMintData";
import { Socials } from "./components/Socials";
import { ConnectWalletAlert } from "./components/ConnectWalletAlert";

export function Mint() {
  const { data, isLoading } = useMintData();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h1 className="title-md">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflow: "hidden" }} className="overflow-hidden">
        <main className="flex flex-col gap-10 md:gap-16 mt-6">
          <ConnectWalletAlert />
          <HeroSection />
          <StatsSection />
          <OurStorySection />
        </main>

        <footer className="footer-container px-6 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between">
          <p>{data?.asset.name}</p>
          <Socials />
        </footer>
      </div>
    </>
  );
}

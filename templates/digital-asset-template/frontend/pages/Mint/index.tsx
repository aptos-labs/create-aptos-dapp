import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { BannerSection } from "./components/BannerSection";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { OurStorySection } from "./components/OurStorySection";
import { HowToMintSection } from "./components/HowToMintSection";
import { OurTeamSection } from "./components/OurTeamSection";
import { FAQSection } from "./components/FAQSection";
import { useMintData } from "./hooks/useMintData";
import { Socials } from "./components/Socials";
import { Header } from "./components/Header";

export function Mint() {
  const { data, isLoading } = useMintData();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h1 className="title-md">Loading...</h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <h1 className="title-md">Collection Not Configured</h1>
        <p className="body-md max-w-md mx-auto mt-8">
          Please ensure you copy your collection's id from your launchpad to
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            frontend/config.ts
          </code>
        </p>
        <p className="body-md max-w-md mx-auto mt-4">
          Configure the remaining sections of the configuration file. Removing a
          section will remove it from the rendered page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflow: "hidden" }} className="overflow-hidden">
      <Header />
      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        <HeroSection />
        <StatsSection />
        <OurStorySection />
        <HowToMintSection />
        <BannerSection />
        <OurTeamSection />
        <FAQSection />
      </main>

      <footer className="footer-container px-6 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between">
        <p>{data.collection.collection_name}</p>
        <Socials />
      </footer>
    </div>
  );
}

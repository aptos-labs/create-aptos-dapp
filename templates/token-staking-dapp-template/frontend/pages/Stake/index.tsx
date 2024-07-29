import { StatsSection } from "@/pages/Stake/components/StatsSection";
import { HowToStakeSection } from "@/pages/Stake/components/HowToStakeSection";
import { FAQSection } from "@/pages/Stake/components/FAQSection";
import { Socials } from "@/pages/Stake/components/Socials";
import { ConnectWalletAlert } from "@/pages/Stake/components/ConnectWalletAlert";
import { BenefitsOfStakingSection } from "./components/BenefitsOfStakingSection";
import { AboutUsSection } from "./components/AboutUsSection";

export const Stake: React.FC = () => {
  return (
    <div style={{ overflow: "hidden" }} className="overflow-hidden">
      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        <ConnectWalletAlert />
        <StatsSection />
        <AboutUsSection />
        <HowToStakeSection />
        <BenefitsOfStakingSection />
        <FAQSection />
      </main>

      <footer className="footer-container px-4 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between">
        {/* <p>{data?.collection.collection_name}</p> */}
        <Socials />
      </footer>
    </div>
  );
};

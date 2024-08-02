import { StatsSection } from "@/pages/Stake/components/StatsSection";
import { HowToStakeSection } from "@/pages/Stake/components/HowToStakeSection";
import { FAQSection } from "@/pages/Stake/components/FAQSection";
import { Socials } from "@/pages/Stake/components/Socials";
import { BenefitsOfStakingSection } from "./components/BenefitsOfStakingSection";
import { AboutUsSection } from "./components/AboutUsSection";
import { UserOperationsSection } from "./components/UserOperations";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export const Stake: React.FC = () => {
  const { tokenData } = useGetTokenData();

  return (
    <div style={{ overflow: "hidden" }} className="overflow-hidden">
      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        <StatsSection />
        <section className="flex flex-col md:flex-row items-start justify-between px-4 py-2 gap-4 max-w-screen-xl mx-auto">
          <AboutUsSection />
          <UserOperationsSection />
        </section>
        <HowToStakeSection />
        <BenefitsOfStakingSection />
        <FAQSection />
      </main>

      <footer className="footer-container px-4 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between">
        <p>{tokenData?.name ?? "TOKEN"}</p>
        <Socials />
      </footer>
    </div>
  );
};

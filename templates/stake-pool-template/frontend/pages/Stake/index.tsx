import { StatsSection } from "@/pages/Stake/components/StatsSection";
import { HowToStakeSection } from "@/pages/Stake/components/HowToStakeSection";
import { FAQSection } from "@/pages/Stake/components/FAQSection";
import { Socials } from "@/pages/Stake/components/Socials";
import { ConnectWalletAlert } from "@/pages/Stake/components/ConnectWalletAlert";
import { BenefitsOfStakingSection } from "./components/BenefitsOfStakingSection";
import { OurStorySection } from "./components/OurStorySection";
import { useGetTokenData } from "@/hooks/useGetTokenData";

interface StakeProps {
  tokenData?: { decimals: number; icon_url: string; name: string; project_uri: string; symbol: string };
}

export const Stake: React.FC<StakeProps> = () => {
  const tokenData = useGetTokenData();
  // const { data, isLoading } = useGetCollectionData();

  // const queryClient = useQueryClient();
  // const { account } = useWallet();
  // useEffect(() => {
  //   queryClient.invalidateQueries();
  // }, [account, queryClient]);

  // if (isLoading) {
  //   return (
  //     <div className="text-center p-8">
  //       <h1 className="title-md">Loading...</h1>
  //     </div>
  //   );
  // }

  return (
    <div style={{ overflow: "hidden" }} className="overflow-hidden">
      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        <ConnectWalletAlert />
        <StatsSection tokenData={tokenData} />
        <OurStorySection tokenData={tokenData} />
        <HowToStakeSection />
        <BenefitsOfStakingSection tokenName={tokenData?.name} />
        <FAQSection />
      </main>

      <footer className="footer-container px-4 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between">
        {/* <p>{data?.collection.collection_name}</p> */}
        <Socials />
      </footer>
    </div>
  );
};

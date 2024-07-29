import { config } from "@/config";
import { Image } from "@/components/ui/image";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export const BenefitsOfStakingSection: React.FC = () => {
  const { tokenData } = useGetTokenData();

  return (
    <section className="how-to-mint-container px-4 text-center max-w-screen-xl mx-auto w-full">
      <h2 className="heading-md">Benefits of staking {tokenData?.name ?? "TOKEN"}</h2>

      <ol className="flex flex-col md:flex-row items-center items-baseline md:justify-between pt-6 gap-6">
        {config.benefits?.map((benefit, index) => (
          <li key={index} className="flex flex-col gap-4 basis-1/4">
            <Image width={24} height={24} src={benefit.icon} className="dark:invert" />
            <p className="body-md text-left">{benefit.title}</p>
            <p className="body-xs font-light text-left">{benefit.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

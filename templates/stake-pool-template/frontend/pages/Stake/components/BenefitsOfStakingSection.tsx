import { config } from "@/config";
import { Image } from "@/components/ui/image";

interface BenefitsOfStakingSectionProps {
  tokenName?: string;
}

export const BenefitsOfStakingSection: React.FC<BenefitsOfStakingSectionProps> = ({ tokenName }) => {
  return (
    <section className="how-to-mint-container px-4 text-center max-w-screen-xl mx-auto w-full">
      <h2 className="heading-md">Benefits of staking {tokenName ?? "TOKEN"}</h2>

      <ol className="flex flex-col md:flex-row items-center md:justify-between pt-6 gap-6">
        {config.benefits?.map((benefit, index) => (
          <li key={index} className="flex flex-col gap-4 basis-1/4">
            <Image width={16} height={16} src={benefit.icon} className="dark:invert" />
            <p className="body-md text-left">{benefit.title}</p>
            <p className="body-xs font-light text-left">{benefit.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

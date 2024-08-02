// Internal components
import { buttonVariants } from "@/components/ui/button";

// Internal config
import { config } from "@/config";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export const AboutUsSection: React.FC = () => {
  const { tokenData } = useGetTokenData();

  return (
    <div className="basis-1/2">
      <p className="label-sm">{config.aboutUs?.subTitle}</p>
      <p className="heading-md">{`Staking ${tokenData?.name ?? config.aboutUs?.title}`}</p>
      <p className="body-sm pt-2">{config.aboutUs?.description}</p>
      {config.socials?.discord && (
        <a
          href={config.socials.discord}
          target="_blank"
          className={buttonVariants({
            variant: "outline",
            className: "mt-4",
          })}
        >
          Join Our Discord
        </a>
      )}
    </div>
  );
};

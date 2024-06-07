import { buttonVariants } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { config } from "@/config";
import { FC } from "react";
import Twitter from "@/assets/icons/twitter.svg";
import Link from "@/assets/icons/link.svg";
import Discord from "@/assets/icons/discord.svg";

export const Socials: FC = () => {
  if (!config.socials) return null;

  return (
    <ul className="flex gap-4">
      {config.socials.twitter && (
        <li>
          <a
            target="_blank"
            href={config.socials.twitter}
            className={buttonVariants({ variant: "icon", size: "icon" })}>
            <Image src={Twitter} />
          </a>
        </li>
      )}
      {config.socials.discord && (
        <li>
          <a
            target="_blank"
            href={config.socials.discord}
            className={buttonVariants({ variant: "icon", size: "icon" })}>
            <Image src={Discord} />
          </a>
        </li>
      )}
      {config.socials.homepage && (
        <li>
          <a
            target="_blank"
            href={config.socials.homepage}
            className={buttonVariants({ variant: "icon", size: "icon" })}>
            <Image src={Link} />
          </a>
        </li>
      )}
    </ul>
  );
};

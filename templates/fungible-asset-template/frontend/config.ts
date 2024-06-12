import Placeholder1 from "@/assets/placeholders/asset.png";

export const config: Config = {
  // TODO: Fill in your asset id
  asset_id: "",

  // Removing one or all of these socials will remove them from the page
  socials: {
    twitter: "https://twitter.com",
    discord: "https://discord.com",
    homepage: "#",
  },

  defaultAsset: {
    name: "ABC Fungible Asset",
    image: Placeholder1,
  },

  ourStory: {
    title: "About",
    description: `ABC Meme Coin is the latest sensation in the crypto world, bringing a playful twist to digital currency. Born from a love of internet culture and humor, ABC Meme Coin combines the excitement of cryptocurrency with the infectious joy of memes. With a community-driven approach, this coin aims to create a fun, engaging, and supportive ecosystem for meme enthusiasts and crypto investors alike. Join us in this whimsical financial revolution, where laughter and innovation go hand in hand, and let's make crypto a bit more fun together!`,
    discordLink: "https://discord.com",
  },
};

export interface Config {
  asset_id: string;

  socials?: {
    twitter?: string;
    discord?: string;
    homepage?: string;
  };

  defaultAsset?: {
    name: string;
    image: string;
  };

  ourStory?: {
    title: string;
    subTitle?: string;
    description: string;
    discordLink: string;
  };
}

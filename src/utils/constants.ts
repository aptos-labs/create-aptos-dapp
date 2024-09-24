// GA4
export const GA_MEASURMENT_ID = "G-QCE2R28N2J";
export const GA_CLIENT_ID = "Xhptd45qQKiPALmqqRheqg";
export const GA4_URL = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASURMENT_ID}&api_secret=${GA_CLIENT_ID}`;
export const GA4_URL_DEBUG = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA_MEASURMENT_ID}&api_secret=${GA_CLIENT_ID}`;

// The description we generate as a doc string in the .env file for the module publisher account private key variable
export const MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION =
  "#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.";

export enum TemplateProjectType {
  MOVE = "move",
  FULLSTACK = "fullstack",
}

export enum TemplateNetwork {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
}

export enum TemplateFramework {
  NEXTJS = "nextjs",
  VITE = "vite",
}

export enum TemplateSigningOption {
  EXPLICIT = "explicit",
  SEAMLESS = "seamless",
}

export const ContractBoilerplateTemplateValues = {
  path: "contract-boilerplate-template",
  name: "Move Contract Template",
  doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate",
};

export const FullstackBoilerplateTemplateInfo = {
  title: "Boilerplate Template",
  value: {
    path: "boilerplate-template",
    name: "Boilerplate Template",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate",
  },
  description: "A boilerplate template to start an Aptos dapp with",
};

export const ClickerGameTgTemplateInfo = {
  title: "A clicker game Telegram Mini App",
  value: {
    path: "clicker-game-tg-mini-app-template",
    name: "Clicker Game Telegram Mini App Template",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/clicker-game-tg-mini-app",
  },
  description:
    "A clicker game Telegram Mini App template to start an Aptos dapp with",
};

export const CustomIndexerTemplateInfo = {
  title: "Full stack dapp with custom indexer",
  value: {
    path: "custom-indexer-template",
    name: "Full stack dapp with custom indexer",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/custom-indexer",
  },
  description:
    "A full stack dapp template with a custom indexer to start an Aptos dapp with",
};

export const NftMintingDappTemplateInfo = {
  title: "NFT minting dapp",
  value: {
    path: "nft-minting-dapp-template",
    name: "NFT minting dapp",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/nft-minting-dapp",
    video: "https://www.youtube.com/watch?v=ik4GfsKZDOQ",
  },
  description:
    "A production ready template to create an NFT collection minting dapp",
};

export const TokenMintingDappTemplateInfo = {
  title: "Token minting dapp",
  value: {
    path: "token-minting-dapp-template",
    name: "Token minting dapp",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/token-minting-dapp",
    video: "https://www.youtube.com/watch?v=cr7LS-k4nQo",
  },
  description:
    "A production ready template to create your own token minting dapp",
};

export const TokenStakingDappTemplateInfo = {
  title: "Token staking dapp",
  value: {
    path: "token-staking-dapp-template",
    name: "Token staking dapp",
    doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/token-staking-dapp",
    video: "https://www.youtube.com/watch?v=xWkAVVE4WXk",
  },
  description: "A production ready template to create a token staking dapp",
};

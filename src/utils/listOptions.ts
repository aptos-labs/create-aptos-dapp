import {
  FullstackBoilerplateTemplateInfo,
  NftMintingDappTemplateInfo,
  TokenMintingDappTemplateInfo,
  TokenStakingDappTemplateInfo,
  CustomIndexerTemplateInfo,
} from "./constants.js";

export function printOptionsJson(): void {
  const options = {
    projectTypes: ["move", "fullstack"],
    templates: {
      "boilerplate-template": {
        name: FullstackBoilerplateTemplateInfo.value.name,
        projectType: "fullstack",
        frameworks: ["vite", "nextjs"],
        networks: ["mainnet", "testnet", "devnet"],
        supportsSurf: true,
      },
      "nft-minting-dapp-template": {
        name: NftMintingDappTemplateInfo.value.name,
        projectType: "fullstack",
        frameworks: ["vite"],
        networks: ["mainnet", "testnet"],
        supportsSurf: false,
      },
      "token-minting-dapp-template": {
        name: TokenMintingDappTemplateInfo.value.name,
        projectType: "fullstack",
        frameworks: ["vite"],
        networks: ["mainnet", "testnet"],
        supportsSurf: false,
      },
      "token-staking-dapp-template": {
        name: TokenStakingDappTemplateInfo.value.name,
        projectType: "fullstack",
        frameworks: ["vite"],
        networks: ["mainnet", "testnet", "devnet"],
        supportsSurf: false,
      },
      "custom-indexer-template": {
        name: CustomIndexerTemplateInfo.value.name,
        projectType: "fullstack",
        frameworks: ["nextjs"],
        networks: ["mainnet", "testnet", "devnet"],
        supportsSurf: false,
      },
    },
    frameworks: ["vite", "nextjs"],
    networks: ["mainnet", "testnet", "devnet"],
  };

  console.log(JSON.stringify(options, null, 2));
  process.exit(0);
}

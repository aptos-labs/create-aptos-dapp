require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress = config["profiles"][`${process.env.PROJECT_NAME}-${process.env.VITE_APP_NETWORK}`]["account"];

async function compile() {

    // Check FA_ADDRESS exists
    const aptosConfig = new aptosSDK.AptosConfig({network:process.env.VITE_APP_NETWORK})
    const aptos = new aptosSDK.Aptos(aptosConfig)
    const isFungibleAsset = await aptos.getFungibleAssetMetadataByAssetType({assetType:process.env.VITE_FA_ADDRESS})
     
    if (!isFungibleAsset) {
      throw new Error(
        "Fungible Asset does not exist. Make sure you have set up the correct asset as the VITE_FA_ADDRESS in the .env file",
      );
    }

    // Make sure VITE_REWARD_CREATOR_ADDRESS is set
    if (!process.env.VITE_REWARD_CREATOR_ADDRESS) {
      throw new Error("Please set the VITE_REWARD_CREATOR_ADDRESS in the .env file");
    }
  
    // Make sure VITE_REWARD_CREATOR_ADDRESS exists
    try {
      await aptos.getAccountInfo({ accountAddress: process.env.VITE_REWARD_CREATOR_ADDRESS });
    } catch (error) {
      throw new Error(
        "Account does not exist. Make sure you have set up the correct address as the VITE_REWARD_CREATOR_ADDRESS in the .env file",
      );
    }

  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "contracts",
    namedAddresses: {
      // Compile module with account address
      stake_pool_addr: accountAddress,
      fa_obj_addr: process.env.VITE_FA_ADDRESS,
      initial_reward_creator_addr: process.env.VITE_REWARD_CREATOR_ADDRESS,
    },
  });
}
compile();

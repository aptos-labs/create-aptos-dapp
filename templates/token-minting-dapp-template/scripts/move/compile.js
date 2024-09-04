require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][`${process.env.PROJECT_NAME}-${process.env.VITE_APP_NETWORK}`]["account"];

async function compile() {
    const aptosConfig = new aptosSDK.AptosConfig({network:process.env.VITE_APP_NETWORK})
    const aptos = new aptosSDK.Aptos(aptosConfig)
  
    // Make sure VITE_FA_CREATOR_ADDRESS is set
    if (!process.env.VITE_FA_CREATOR_ADDRESS) {
      throw new Error("Please set the VITE_FA_CREATOR_ADDRESS in the .env file");
    }
  
    // Make sure VITE_FA_CREATOR_ADDRESS exists
    try {
      await aptos.getAccountInfo({ accountAddress: process.env.VITE_FA_CREATOR_ADDRESS });
    } catch (error) {
      throw new Error(
        "Account does not exist. Make sure you have set up the correct address as the VITE_FA_CREATOR_ADDRESS in the .env file",
      );
    }
  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "contracts",
    namedAddresses: {
      // Publish module to account address
      launchpad_addr: accountAddress,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_addr: process.env.VITE_FA_CREATOR_ADDRESS,
    },
  });
}
compile();

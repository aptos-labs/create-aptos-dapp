require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

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

    if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
      throw new Error(
        "VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS variable is not set, make sure you have set the publisher account address",
      );
    }
  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "contract",
    namedAddresses: {
      // Publish module to account address
      launchpad_addr: process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_addr: process.env.VITE_FA_CREATOR_ADDRESS,
    },
  });
}
compile();

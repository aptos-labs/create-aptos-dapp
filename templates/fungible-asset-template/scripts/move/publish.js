require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

async function publish() {
  if (!process.env.VITE_FA_CREATOR_ADDRESS) {
    throw new Error(
      "VITE_FA_CREATOR_ADDRESS variable is not set, make sure you set it on the .env file"
    );
  }
  const move = new cli.Move();

  await move.publish({
    packageDirectoryPath: "move",
    namedAddresses: {
      // Publish module to account address
      launchpad_addr: accountAddress,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_addr: process.env.VITE_FA_CREATOR_ADDRESS,
    },
    profile: process.env.VITE_APP_NETWORK,
  });
}
publish();

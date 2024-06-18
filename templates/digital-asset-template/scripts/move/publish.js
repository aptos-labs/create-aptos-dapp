require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

async function publish() {
  const move = new cli.Move();

  await move.publish({
    packageDirectoryPath: "move",
    namedAddresses: {
      launchpad_addr: accountAddress,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_address: "to_fill",
      // Please find it on the network you are using
      // This is testnet deployment
      minter:
        "0x93f379226ae424367346b2803b340b1eda36cb2416037a7e71a6761e3a551e5c",
    },
    profile: process.env.VITE_APP_NETWORK,
  });
}
publish();

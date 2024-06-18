require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

async function compile() {
  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "move",
    namedAddresses: {
      // Publish module to account address
      launchpad_addr: accountAddress,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_addr: process.env.VITE_CREATOR_ADDRESS,
      // Our contract depends on the token-minter contract to provide some common NFT functionalities like managing refs and mint stages
      // You can read the source code of it here: https://github.com/aptos-labs/token-minter/
      // Please find it on the network you are using, This is testnet deployment
      minter:
        "0x93f379226ae424367346b2803b340b1eda36cb2416037a7e71a6761e3a551e5c",
    },
  });
}
compile();

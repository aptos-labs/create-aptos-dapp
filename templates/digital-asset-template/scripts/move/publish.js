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
      // Please find it on the network you are using
      // This is my own deployed version on testnet
      minter:
        "0xb31c421b64aa345df39a374459757244eeb70bd94886f47a32c2f886b662f7d0",
    },
    profile: process.env.VITE_APP_NETWORK,
  });
}
publish();

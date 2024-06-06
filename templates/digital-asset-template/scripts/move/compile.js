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
      launchpad_addr: accountAddress, // make launchpad_addr generic and fetch from Move.toml file
      // Please find it on the network you are using
      // This is my own deployed version on testnet
      minter:
        "0x9d7365d7a09ee3a5610a2131d6ee395531d581e7a7c42582de51a3f111534bbd",
    },
  });
}
compile();

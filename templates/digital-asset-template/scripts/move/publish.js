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
      module_addr: accountAddress, // make module_addr generic and fetch from Move.toml file
    },
    profile: process.env.VITE_APP_NETWORK,
  });
}
publish();
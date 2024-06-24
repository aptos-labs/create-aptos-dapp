require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function init() {
  const move = new cli.Move();

  await move.init({
    network: process.env.VITE_APP_NETWORK,
    profile: process.env.PROFILE_NAME,
  });
}
init();

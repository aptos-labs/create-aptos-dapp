require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

const packageName = "AptosFriend";
const scriptName = "issue_share_and_buy_share";

async function issueAndBuyShare() {
  if (!process.env.VITE_MODULE_ADDRESS) {
    throw new Error(
      "VITE_MODULE_ADDRESS variable is not set, make sure you have published the module before running this Move script",
    );
  }

  const move = new cli.Move();

  move.runScript({
    compiledScriptPath: `contract/build/${packageName}/bytecode_scripts/${scriptName}.mv`,
    extraArguments: [
      `--private-key=${process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,
      `--url=${aptosSDK.NetworkToNodeAPI[process.env.VITE_APP_NETWORK]}`,
    ],
  });
}
issueAndBuyShare();

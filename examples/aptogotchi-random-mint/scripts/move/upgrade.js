require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk");

async function publish() {
  if (!process.env.NEXT_PUBLIC_MODULE_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_MODULE_ADDRESS variable is not set, make sure you have published the module before upgrading it"
    );
  }

  const move = new cli.Move();

  move.upgradeObjectPackage({
    packageDirectoryPath: "contract",
    objectAddress: process.env.NEXT_PUBLIC_MODULE_ADDRESS,
    namedAddresses: {
      // Upgrade module from an object
      aptogotchi_addr: process.env.NEXT_PUBLIC_MODULE_ADDRESS,
    },
    extraArguments: [
      `--private-key=${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,
      `--url=${aptosSDK.NetworkToNodeAPI[process.env.NEXT_PUBLIC_APP_NETWORK]}`,
    ],
  });
}
publish();

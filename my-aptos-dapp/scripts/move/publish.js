require("dotenv").config();
const fs = require("node:fs");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

async function publish() {

  if (!process.env.MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
    throw new Error(
      "MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account address",
    );
  }

  if (!process.env.MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    throw new Error(
      "MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account private key",
    );
  }

  const move = new cli.Move();

  move
    .createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "message_board_addr",
      namedAddresses: {
        // Publish module to new object, but since we create the object on the fly, we fill in the publisher's account address here
        message_board_addr: process.env.MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      },
      extraArguments: [`--private-key=${process.env.MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,`--url=${aptosSDK.NetworkToNodeAPI[process.env.APP_NETWORK]}`],
    })
    .then((response) => {
      const filePath = ".env";
      let envContent = "";

      // Check .env file exists and read it
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, "utf8");
      }

      // Regular expression to match the MODULE_ADDRESS variable
      const regex = /^MODULE_ADDRESS=.*$/m;
      const newEntry = `MODULE_ADDRESS=${response.objectAddress}`;

      // Check if MODULE_ADDRESS is already defined
      if (envContent.match(regex)) {
        // If the variable exists, replace it with the new value
        envContent = envContent.replace(regex, newEntry);
      } else {
        // If the variable does not exist, append it
        envContent += `\n${newEntry}`;
      }

      // Write the updated content back to the .env file
      fs.writeFileSync(filePath, envContent, "utf8");
    });
}
publish();

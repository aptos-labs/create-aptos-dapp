require("dotenv").config();
const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][
    `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`
  ]["account"];

async function publish() {
  const move = new cli.Move();

  move
    .createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "message_board_addr",
      namedAddresses: {
        // Publish module to new object, but since we create the object on the fly, we fill in the publisher's account address here
        message_board_addr: accountAddress,
      },
      profile: `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`,
    })
    .then((response) => {
      const filePath = ".env";
      let envContent = "";

      // Check .env file exists and read it
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, "utf8");
      }

      // Regular expression to match the NEXT_PUBLIC_MODULE_ADDRESS variable
      const regex = /^NEXT_PUBLIC_MODULE_ADDRESS=.*$/m;
      const newEntry = `NEXT_PUBLIC_MODULE_ADDRESS=${response.objectAddress}`;

      // Check if NEXT_PUBLIC_MODULE_ADDRESS is already defined
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

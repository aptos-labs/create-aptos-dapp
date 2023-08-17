import prompts from "prompts";

export async function startStandardWorkflow() {
  let step = 0;
  let quit = false;
  let result = {};

  while (!quit) {
    switch (step) {
      case 0:
        const projectPath = await prompts({
          type: "text",
          name: "projectPath",
          message: "Project name",
          initial: "my-aptos-dapp",
        });
        result["projectPath"] = projectPath["projectPath"];
        step++;
        break;
      case 1:
        const template: Number | String = await prompts({
          type: "select",
          name: "template",
          message: "Choose how to start",
          choices: [
            {
              title: "Boilerplate dapp",
              value: "new",
              message: "Start building your application from scratch",
            },
            {
              title: "Todolist dapp",
              value: "todolist",
              message: "A template to build todo list dapp",
            },
            {
              title: "NFT marketplace (coming soon)",
              value: "nft-marketplace",
              message: "A template to build NFTs marketplace",
              disabled: true,
            },
            {
              title: "Defi (coming soon)",
              value: "defi",
              message: "A template to build defi dapp",
              disabled: true,
            },
          ],
          initial: 0,
          hint: "- Create a default dapp ",
        });
        result["template"] = template["template"];
        step++;
        break;
      case 2:
        const network = await prompts({
          type: "select",
          name: "network",
          message: "Choose your network",
          choices: [
            { title: "Mainnet", value: "mainnet" },
            { title: "Testnet", value: "testnet" },
            { title: "Devnet", value: "devnet" },
          ],
          initial: 0,
          hint: "- You can change this later",
        });
        result["network"] = network["network"];
        step++;
        break;
      case 3:
        await prompts({
          type: "select",
          name: "package-manager",
          message: "Choose your package manager",
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn", disabled: true },
            { title: "pnpm", value: "pnpm", disabled: true },
          ],
          initial: 0,
        });
        result["package-manager"] = "npm";
        quit = true;
        break;
    }
  }

  return result;
}

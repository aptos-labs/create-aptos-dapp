import prompts from "prompts";

export async function startStandardWorkflow() {
  let step = 0;
  let quit = false;

  while (!quit) {
    switch (step) {
      case 0:
        const projectPath = await prompts({
          type: "text",
          name: "projectPath",
          message: "Project name",
          initial: "my-aptos-dapp",
        });
        step++;
        break;
      case 1:
        const template: Number | String = await prompts({
          type: "select",
          name: "template",
          message: "Choose how to start",
          choices: [
            {
              title: "Boilerplates dapp",
              value: "new",
              message: "Start building your application from scratch",
            },
            {
              title: "NFT Explorer (soon)",
              value: "nft-explorer",
              message: "A template to build NFTs explorers",
              disabled: true,
            },
            {
              title: "NFT marketplace (soon)",
              value: "nft-marketplace",
              message: "A template to build NFTs marketplace",
              disabled: true,
            },
            {
              title: "Defi (soon)",
              value: "defi",
              message: "A template to build a defi dapp",
              disabled: true,
            },
          ],
          initial: 0,
          hint: "- Create a default app ",
        });

        step++;
        break;
      case 2:
        await prompts({
          type: "select",
          name: "chain",
          message: "Choose your chain",
          choices: [
            { title: "Mainnet", value: "MAINNET" },
            { title: "Testnet", value: "TESTNET" },
            { title: "Devnet", value: "DEVNET" },
          ],
          initial: 0,
          hint: "- You can change this later",
        });
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
        quit = true;
        break;
    }
  }
}

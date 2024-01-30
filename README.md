## Create Aptos Dapp

`create-aptos-dapp` provides a starter kit for dapp developers to easily bootstrap a dapp on the Aptos network.

> **_NOTE:_** No need to clone: run `npx create-aptos-dapp` in your terminal to get started

### Quick Start

To create a Aptos dapp, open your terminal, cd into the directory you’d like to create the dapp in, and run the following command:

```bash
npx create-aptos-dapp
```

Then follow the prompts!

([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, [see instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))

### What is create-aptos-dapp?

`create-aptos-dapp` simplifies the initial setup and configuration process, provides a modern development workflow, and offers a range of benefits that save time and effort, enabling developers to focus on building dapps on Aptos effectively.

`create-aptos-dapp` streamlines the initial setup of a dapp development project, provides a solid foundation, and allows developers to start coding quickly without getting bogged down by configuration and boilerplate code

### Why use create-aptos-dapp?

- **Boilerplate Setup**: `create-aptos-dapp` tool generates a predefined project structure and configuration files for you. This saves you from manually setting up the basic project structure, which can be time-consuming and error-prone.
- **Dependencies Management**: `create-aptos-dapp` tool manages project dependencies for you. It generates a `package.json` file with the required packages and their versions, ensuring that your project uses compatible libraries.
- **Move Folder:** `create-aptos-dapp` generates a `move` folder that includes the basic structure for move modules. It creates a `Move.toml` and `sources` folder with a move module (smart contract) in it.
- **Best Practices**: `create-aptos-dapp` tool incorporates best practices and structure recommendations to develop for the Aptos network. This ensures that your project starts with a solid foundation.
- **Built-in Scripts**: `create-aptos-dapp` tool includes built-in scripts for common tasks like initialize default profile, compile move module and publish smart contract to chain. This simplifies common development workflows.

### Prerequisites

- [node and npm](https://nodejs.org/en) (npm ≥ 5.2.0)

### Templates

`create-aptos-dapp` generates a predefined template structure and configuration files for you

- **web dapp boilerplate**: A simple and light-weight web based dapp template that includes the basic structure needed for starting a dapp
- **node dapp boilerplate**: A simple and light-weight node template that includes the basic structure needed for starting a node project on Aptos.
- **todolist dapp boilerplate**: A fully working todo list dapp with a pre-implemented smart contract and UI

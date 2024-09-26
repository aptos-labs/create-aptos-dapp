## Create Aptos Dapp

`create-aptos-dapp` provides a starter kit for dapp developers to easily bootstrap on the Aptos network

> **_NOTE:_** No need to clone: run `npx create-aptos-dapp@latest` in your terminal to get started

### Quick Start

To create a Aptos dapp, open your terminal, cd into the directory you’d like to create the dapp in, and run the following command:

```bash
npx create-aptos-dapp@latest
```

Then follow the prompts!

([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, [see instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))

### Prerequisites

- [node and npm](https://nodejs.org/en) (npm ≥ 5.2.0)
- [Python 3.6+](https://www.python.org/)

### What is create-aptos-dapp?

`create-aptos-dapp` simplifies the initial setup and configuration process, provides a modern development workflow, gives pre-made e2e dapp templates, and offers a range of benefits that save time and effort. Using create-aptos-dapp enables developers to build dapps quicker on Aptos.

### Why use create-aptos-dapp?

- **Template Setup:** create-aptos-dapp generates predefined end-to-end dapp templates and configuration files for you. It saves manual setup of the project structure, which can be time-consuming and error-prone.
- **Dependencies Management:** create-aptos-dapp manages project dependencies for you. It generates a npm (or pnpm, etc.) package with the required packages. This ensures that the libraries used by your project are compatible.
- **Move Directory:** create-aptos-dapp generates a move directory that includes the basic structure for Move modules (smart contracts). Additionally, it adds a basic Move module and associated files.
- **Best Practices:** create-aptos-dapp incorporates best practices and structure recommendations to develop for the Aptos network. This ensures that your project starts with a solid foundation.
- **Built-in Move Commands:** create-aptos-dapp includes built-in commands for common tasks, such as initializing the Move compiler, compiling, and publishing smart contracts on-chain. This abstracts Move development workflows for the average dapp developer.

### Templates

`create-aptos-dapp` provides you with pre-made end-to-end dapp templates, i.e a ready dapp with configurations and a beautiful UI to get you started with creating a dapp on Aptos.

- **Boilerplate Template:** A minimal dapp that has an empty contract and a UI that only connects to wallet
- **Digital Asset Template:** A minting NFT dapp
- **Fungible Asset Template:** A minting fungible asset dapp

### Examples

`create-aptos-dapp` also provides you with full stack examples that are for educational purpose, these examples are not production ready and not audited.

- **Aptos Friend Template:** A friend tech style social app that implements share trading

### Releasing a new version

Run this to publish a new version to npm:

```bash
pnpm publish-to-npm
```

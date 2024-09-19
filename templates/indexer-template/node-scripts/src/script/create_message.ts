import { getSurfClient, getAccount } from "../lib/utils";

const run = async () => {
  getSurfClient()
    .entry.create_message({
      typeArguments: [],
      functionArguments: ["hahahahaah indexer is working ooooooo"],
      account: getAccount(),
    })
    .then(console.log);
};

run();

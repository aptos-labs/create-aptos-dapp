import { getSurfClient, getAccount } from "../lib/utils";

const run = async () => {
  getSurfClient()
    .entry.update_message({
      typeArguments: [],
      functionArguments: [
        "0x7f37bcfed49904375b012ceae8fdcca58d8c43dc224cbf78a1a0db0f3a32e9cb",
        "this is an updated message",
      ],
      account: getAccount(),
    })
    .then(console.log);
};

run();

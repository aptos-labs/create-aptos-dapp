require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function test() {
  const move = new cli.Move();

  await move.test({
    packageDirectoryPath: "move",
    namedAddresses: {
      staking_addr: "0x999",
      staked_fa_obj_addr: "0x998",
      reward_fa_obj_addr: "0x997",
      initial_reward_creator_addr: "0x996",
    },
  });
}
test();

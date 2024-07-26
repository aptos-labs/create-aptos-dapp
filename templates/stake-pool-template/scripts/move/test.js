require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function test() {
  const move = new cli.Move();

  await move.test({
    packageDirectoryPath: "move",
    namedAddresses: {
      stake_pool_addr: "0x100",
      staked_fa_obj_addr: "0x200",
      reward_fa_obj_addr: "0x200",
      initial_reward_creator_addr: "0x300",
    },
  });
}
test();

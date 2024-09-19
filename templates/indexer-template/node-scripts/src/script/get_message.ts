import { getSurfClient } from "../lib/utils";

const run = async () => {
  getSurfClient()
    .view.get_message_content({
      typeArguments: [],
      functionArguments: [
        "0x5830e5ee9c9ce1dcbc7a3ff6e8d23f556a99eb21e913ecbdae4c623c314850d1",
      ],
    })
    .then(console.log);
};

run();

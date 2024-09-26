import { MODULE_ADDRESS } from "@/constants";
import { aptosClient } from "@/utils/aptosClient";

export const getCounter = async (userAddr: string): Promise<number> => {
  const content = await aptosClient()
    .view<[number]>({
      payload: {
        function: `${MODULE_ADDRESS}::tg_ex_counter_app::tg_ex_count`,
        functionArguments: [userAddr],
      },
    })
    .catch((error) => {
      console.error(error);
      return [0];
    });

  return content[0];
};

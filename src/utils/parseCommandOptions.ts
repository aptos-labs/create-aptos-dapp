import { generateExample } from "../generateExample.js";

export const parseCommandOptions = async (options) => {
  // if `--example` flag
  if (options.example) {
    return await generateExample(options);
  }
};

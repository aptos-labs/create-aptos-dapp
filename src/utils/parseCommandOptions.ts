import { generateExample } from "../generateExample.js";
import { context } from "./context.js";

export const parseCommandOptions = async (options) => {
  // if `--example` flag is set, generate example and skip wizard flow
  if (options.example) {
    return await generateExample(options);
  }
  if (options.verbose) {
    context.verbose = true;
  }
};

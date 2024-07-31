import { red } from "kolorist";
import fs from "fs";
import kill from "./kill";

export enum LogLevel {
  "MESSAGE" = "message",
  "ERROR" = "error",
}

let root = "";
export const setRoot = (path: string) => {
  root = path;
};

let isVerbose = false;
export const setVerbosity = (_isVerbose: boolean) => (isVerbose = _isVerbose);

export const selfDestroy = (error?, logLevel: LogLevel = LogLevel.MESSAGE) => {
  if ((error && isVerbose) || logLevel == LogLevel.MESSAGE)
    console.error(red(error));
  kill();
  fs.rmSync(root, {
    recursive: true,
    force: true,
  });
  process.exit(1);
};

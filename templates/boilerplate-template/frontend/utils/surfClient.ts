import { createSurfClient } from "@thalalabs/surf";
import { aptosClient } from "./aptosClient";

const surf = createSurfClient(aptosClient());

export function surfClient() {
  return surf;
}

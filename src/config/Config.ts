import { config as devConfig } from "@config/development.config";
import { config as prdConfig } from "@config/production.config";

type NodeEnvType = "development" | "production";
declare var NODE_ENV: NodeEnvType;
export interface Config {
  apiRoot: string;
  apiPort: number;
}

export const getConfig = () => {
  if (NODE_ENV === "development") {
    return devConfig;
  } else if (NODE_ENV === "production") {
    return prdConfig;
  } else {
    throw new Error("config was not found");
  }
};

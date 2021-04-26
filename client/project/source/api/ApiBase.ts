import axios from "axios";
import { getConfig } from "@config/Config";

const config = getConfig();
function getClient() {
  const client = axios.create({
    baseURL: `http://${config.apiRoot}:${config.apiPort}`,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    responseType: "json",
    timeout: 15000,
    validateStatus: () => true,
  });
  return client;
}

export const get = <REQ>(
  ver: number,
  apiCategory: string,
  path: string,
  handler: (req: any) => REQ
) => {
  return async (_req: any) => {
    const req: REQ = handler(_req);
    if (req == null) {
      throw new Error();
    }
    const client = getClient();
    const apiPath = `${apiCategory}/v${ver}/${path}`;
    const result = await client.get(apiPath);
    return result;
  };
};

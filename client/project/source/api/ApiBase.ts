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

const getPath = (req: any, pathWithParams: string) => {
  let path = pathWithParams;
  if (req != null) {
    for (const key of Object.keys(req)) {
      path = path.replace(`:${key}`, (req as any)[key]);
    }
  }
  return path;
};

export const getWithPathParams = <PATHPARAMS>(
  ver: number,
  apiCategory: string,
  pathWithParams: string,
  checkPathParams: ((pathParams: PATHPARAMS) => void) | undefined
) => {
  return async (pathParams: PATHPARAMS) => {
    if (checkPathParams != null) {
      if (pathParams == null) {
        throw new Error("path parameters is required");
      }
      checkPathParams(pathParams);
    }
    const path = getPath(pathParams, pathWithParams);
    return await get(ver, apiCategory, path)();
  };
};

export const get = (ver: number, apiCategory: string, path: string) => {
  return async () => {
    const client = getClient();
    const apiPath = `${apiCategory}/v${ver}/${path}`;
    return await client.get(apiPath);
  };
};

export const putWithPathParams = <PATHPARAMS, BODYPARAMS>(
  ver: number,
  apiCategory: string,
  pathWithParams: string,
  checkPathParams: ((pathParams: PATHPARAMS) => void) | undefined,
  checkBodyParams: ((bodyParams: BODYPARAMS) => void) | undefined
) => {
  return async (pathParams: PATHPARAMS, bodyParams: BODYPARAMS) => {
    if (checkPathParams != null) {
      if (pathParams == null) {
        throw new Error("path parameters is required");
      }
      checkPathParams(pathParams);
    }
    if (checkBodyParams != null) {
      if (bodyParams == null) {
        throw new Error("body parameters is required");
      }
      checkBodyParams(bodyParams);
    }
    const path = getPath(pathParams, pathWithParams);
    const client = getClient();
    const apiPath = `${apiCategory}/v${ver}/${path}`;
    return await client.put(apiPath, bodyParams);
  };
};

export const deleteWithPathParams = <PATHPARAMS>(
  ver: number,
  apiCategory: string,
  pathWithParams: string,
  checkPathParams: ((pathParams: PATHPARAMS) => void) | undefined
) => {
  return async (pathParams: PATHPARAMS) => {
    if (checkPathParams != null) {
      if (pathParams == null) {
        throw new Error("path parameters is required");
      }
      checkPathParams(pathParams);
    }
    const path = getPath(pathParams, pathWithParams);
    const client = getClient();
    const apiPath = `${apiCategory}/v${ver}/${path}`;
    return await client.delete(apiPath);
  };
};

export const putWithId = <BODYPARAMS>(
  ver: number,
  apiCategory: string,
  pathWithParams: string,
  checkBodyParams: ((bodyParams: BODYPARAMS) => void) | undefined
) => {
  return async (id: number, bodyParams: BODYPARAMS) => {
    return putWithPathParams(
      ver,
      apiCategory,
      pathWithParams,
      undefined,
      checkBodyParams
    )({ id }, bodyParams);
  };
};

export const deleteWithId = (
  ver: number,
  apiCategory: string,
  pathWithParams: string
) => {
  return async (id: number) => {
    return deleteWithPathParams(
      ver,
      apiCategory,
      pathWithParams,
      undefined
    )({ id });
  };
};

export const post = <BODYPARAMS>(
  ver: number,
  apiCategory: string,
  path: string,
  checkBodyParams: ((bodyParams: BODYPARAMS) => void) | undefined
) => {
  return async (bodyParams: BODYPARAMS) => {
    if (checkBodyParams != null) {
      if (bodyParams == null) {
        throw new Error("body parameters is required");
      }
      checkBodyParams(bodyParams);
    }
    const client = getClient();
    const apiPath = `${apiCategory}/v${ver}/${path}`;
    return await client.post(apiPath, bodyParams);
  };
};

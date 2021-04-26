import { get } from "@api/ApiBase";

export const PresentationApi = {
  selectInit: get(1, "papi", "init", (req) => req),
};

import { get } from "@api/ApiBase";

export const PresentationApi = {
  selectInit: get(1, "papi", "init", (req) => req),
  selectLedger: get(1, "api", "ledger/:nendo/:ledgerCd", (req) => req),
};

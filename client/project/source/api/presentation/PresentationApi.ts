import { get, getWithPathParams, putWithId } from "@api/ApiBase";
import { JournalEntity } from "@common/model/journal/JournalEntity";

export const PresentationApi = {
  selectInit: get(1, "papi", "init"),
  selectLedger: getWithPathParams<{
    nendo: string;
    ledgerCd: string;
  }>(1, "api", "ledger/:nendo/:ledgerCd", undefined),
  updateJournal: putWithId<Partial<Omit<JournalEntity, "id">>>(
    1,
    "api",
    "journal/:id",
    undefined
  ),
};

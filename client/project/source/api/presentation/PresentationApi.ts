import { get, getWithPathParams, post, putWithId } from "@api/ApiBase";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";

export const PresentationApi = {
  selectInit: get(1, "papi", "init"),
  selectLedger: getWithPathParams<{
    nendo: string;
    ledger_cd: string;
  }>(1, "api", "ledger/:nendo/:ledger_cd", undefined),
  updateJournal: putWithId<Partial<Omit<JournalEntity, "id">>>(
    1,
    "api",
    "journal/:id",
    undefined
  ),
  createLedger: post<LedgerCreateRequest>(1, "api", "ledger", undefined),
  updateLedger: putWithId<Omit<LedgerUpdateRequest, "id">>(
    1,
    "api",
    "ledger/:id",
    undefined
  ),
};

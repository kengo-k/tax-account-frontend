import {
  get,
  getWithPathParams,
  post,
  putWithId,
  deleteWithId,
} from "src/api/ApiBase";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";

export const PresentationApi = {
  selectInit: get(1, "papi", "init"),
  selectSummary: get(1, "papi", "summary"),
  selectJournal: getWithPathParams<{ nendo: string }>(
    1,
    "api",
    "journals/:nendo",
    undefined
  ),
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
  deleteJournal: deleteWithId(1, "api", "journal/:id"),
  createLedger: post<LedgerCreateRequest>(1, "api", "ledger", undefined),
  updateLedger: putWithId<Omit<LedgerUpdateRequest, "id">>(
    1,
    "api",
    "ledger/:id",
    undefined
  ),
};

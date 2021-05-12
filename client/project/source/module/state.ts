import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";
import { KamokuMasterEntity } from "@common/model/master/KamokuMasterEntity";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { SummaryResponse } from "@common/model/presentation/SummaryResponse";

export interface State {
  nendoList: NendoMasterEntity[];
  kamokuList: KamokuMasterEntity[];
  saimokuList: SaimokuMasterEntity[];
  ledgerList: LedgerSearchResponse[];
  journalList: JournalEntity[];
  tmpLedgerCd: string;
  summary: SummaryResponse;
}

export const getInitialState = (): State => {
  return {
    nendoList: [],
    kamokuList: [],
    saimokuList: [],
    ledgerList: [],
    journalList: [],
    tmpLedgerCd: "",
    summary: {
      sales: 0,
      expenses: 0,
      tax: undefined,
    },
  };
};

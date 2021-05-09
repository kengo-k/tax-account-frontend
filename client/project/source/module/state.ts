import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";
import { KamokuMasterEntity } from "@common/model/master/KamokuMasterEntity";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";

export interface State {
  nendoList: NendoMasterEntity[];
  kamokuList: KamokuMasterEntity[];
  saimokuList: SaimokuMasterEntity[];
  ledgerList: LedgerSearchResponse[];
}

export const getInitialState = (): State => {
  return {
    nendoList: [],
    kamokuList: [],
    saimokuList: [],
    ledgerList: [],
  };
};

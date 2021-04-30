import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";
import { KamokuMasterEntity } from "@common/model/master/KamokuMasterEntity";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";

export interface State {
  nendoList: NendoMasterEntity[];
  kamokuList: KamokuMasterEntity[];
  saimokuList: SaimokuMasterEntity[];
}

export const getInitialState = (): State => {
  return {
    nendoList: [],
    kamokuList: [],
    saimokuList: [],
  };
};

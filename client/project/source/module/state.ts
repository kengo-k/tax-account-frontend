import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";

export interface State {
  nendoList: NendoMasterEntity[];
}

export const getInitialState = (): State => {
  return {
    nendoList: [],
  };
};

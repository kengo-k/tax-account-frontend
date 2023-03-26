import { createSelector } from "typeless";
import { state as getState } from "@module/action";
import { NendoMasterEntity } from "@common/model/master/NendoMasterEntity";

export const selectNendoMap = createSelector(
  [getState, (state) => state.nendoList],
  (nendoList) => {
    const map: Map<string, NendoMasterEntity> = new Map();
    for (const nendoEntity of nendoList) {
      map.set(nendoEntity.nendo, nendoEntity);
    }
    return map;
  }
);

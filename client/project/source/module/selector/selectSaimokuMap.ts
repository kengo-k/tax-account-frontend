import { createSelector } from "typeless";
import { state as getState } from "@module/action";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";

export const selectSaimokuMap = createSelector(
  [getState, (state) => state.saimokuList],
  (saimokuList) => {
    const map: Map<string, SaimokuMasterEntity> = new Map();
    for (const saimokuEntity of saimokuList) {
      if (saimokuEntity.id != null) {
        map.set(saimokuEntity.saimoku_cd, saimokuEntity);
      }
    }
    return map;
  }
);

import * as Rx from "typeless/rx";
import { createModule, useActions as _useActions } from "typeless";
import { State, getInitialState } from "@module/state";
import { PresentationApi } from "@api/presentation/PresentationApi";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalEntity } from "@common/model/journal/JournalEntity";

const moduleSymbol = Symbol("account");
const [module, actions, state] = createModule(moduleSymbol)
  .withActions({
    loadInit: null,
    setInit: (initData: InitSearchResponse) => ({
      payload: { initData },
    }),
    loadLedger: (ledgerSearchRequest: LedgerSearchRequest) => ({
      payload: { ledgerSearchRequest },
    }),
    setLedger: (ledgerList: LedgerSearchResponse[]) => ({
      payload: { ledgerList },
    }),
    updateJournal: (
      id: string,
      journal: Partial<Omit<JournalEntity, "id">>,
      nextActions?: any[] | (() => any[])
    ) => ({
      payload: { id, journal, nextActions },
    }),
  })
  .withState<State>();

module
  .epic()
  .on(actions.loadInit, () => {
    return Rx.fromPromise(PresentationApi.selectInit()).pipe(
      Rx.map((res) => {
        return [actions.setInit(res.data.body)];
      })
    );
  })
  .on(actions.loadLedger, ({ ledgerSearchRequest }) => {
    return Rx.fromPromise(
      PresentationApi.selectLedger({
        nendo: ledgerSearchRequest.nendo,
        ledgerCd: ledgerSearchRequest.target_cd,
      })
    ).pipe(
      Rx.map((res) => {
        return [actions.setLedger(res.data.body)];
      })
    );
  })
  .on(actions.updateJournal, ({ id, journal, nextActions }) => {
    return Rx.fromPromise(PresentationApi.updateJournal(id, journal)).pipe(
      Rx.map(() => {
        if (nextActions == null) {
          return [];
        }
        if (typeof nextActions === "function") {
          return nextActions();
        } else {
          return nextActions;
        }
      })
    );
  });

module
  .reducer(getInitialState())
  .on(actions.setInit, (state, { initData }) => {
    state.nendoList = initData.nendoList;
    state.kamokuList = initData.kamokuMasterList;
    state.saimokuList = initData.saimokuMasterList;
  })
  .on(actions.setLedger, (state, { ledgerList }) => {
    state.ledgerList = ledgerList;
  });

export type Actions = typeof actions;

export const useActions = () => {
  return _useActions(actions);
};

export const useState = () => {
  return state.useState();
};

export const getState = () => {
  return state();
};

export const useModule = module;

export { actions, state };

import * as Rx from "typeless/rx";
import { createModule, useActions as _useActions } from "typeless";
import { State, getInitialState } from "@module/state";
import { PresentationApi } from "@api/presentation/PresentationApi";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";

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
      id: number,
      journal: Partial<Omit<JournalEntity, "id">>,
      nextActions?: any[] | (() => any[])
    ) => ({
      payload: { id, journal, nextActions },
    }),
    createLedger: (ledger: LedgerCreateRequest) => ({ payload: { ledger } }),
    updateLedger: (id: number, ledger: Omit<LedgerUpdateRequest, "id">) => ({
      payload: { id, ledger },
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
        ledger_cd: ledgerSearchRequest.ledger_cd,
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
  })
  .on(actions.createLedger, ({ ledger }) => {
    return Rx.fromPromise(PresentationApi.createLedger(ledger)).pipe(
      Rx.map((res) => {
        return [
          actions.loadLedger({
            nendo: res.data.body.nendo,
            ledger_cd: ledger.ledger_cd,
          }),
        ];
      })
    );
  })
  .on(actions.updateLedger, ({ id, ledger }) => {
    return Rx.fromPromise(PresentationApi.updateLedger(id, ledger)).pipe(
      Rx.map((res) => {
        return [
          actions.loadLedger({
            nendo: res.data.body.nendo,
            ledger_cd: ledger.ledger_cd,
          }),
        ];
      })
    );
  });

module
  .reducer(getInitialState())
  .on(actions.setInit, (state, { initData }) => {
    state.nendoList = initData.nendo_list;
    state.kamokuList = initData.kamoku_list;
    state.saimokuList = initData.saimoku_list;
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

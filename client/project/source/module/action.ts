import * as Rx from "typeless/rx";
import { createModule, useActions as _useActions } from "typeless";
import { State, getInitialState } from "@module/state";
import { PresentationApi } from "@api/presentation/PresentationApi";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";

const moduleSymbol = Symbol("account");
const [module, actions, state] = createModule(moduleSymbol)
  .withActions({
    loadInit: null,
    setInit: (initData: InitSearchResponse) => ({
      payload: { initData },
    }),
  })
  .withState<State>();

module.epic().on(actions.loadInit, () => {
  return Rx.fromPromise(PresentationApi.selectInit({})).pipe(
    Rx.map((res) => {
      return [actions.setInit(res.data.body)];
    })
  );
});

module.reducer(getInitialState()).on(actions.setInit, (state, { initData }) => {
  state.nendoList = initData.nendoList;
  state.kamokuList = initData.kamokuMasterList;
  state.saimokuList = initData.saimokuMasterList;
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

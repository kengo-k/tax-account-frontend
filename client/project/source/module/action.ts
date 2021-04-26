import * as Rx from "typeless/rx";
import { createModule, useActions as _useActions } from "typeless";
import { State, getInitialState } from "@module/state";
import { PresentationApi } from "@api/presentation/PresentationApi";

const moduleSymbol = Symbol("account");
const [module, actions, state] = createModule(moduleSymbol)
  .withActions({
    loadInit: null,
  })
  .withState<State>();

module.epic().on(actions.loadInit, () => {
  return Rx.fromPromise(PresentationApi.selectInit({})).pipe(
    Rx.map(() => {
      return [];
    })
  );
});

module.reducer(getInitialState());

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

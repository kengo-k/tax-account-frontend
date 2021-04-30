import * as React from "react";
import { History } from "history";
import {
  BrowserRouter,
  Route,
  Switch,
  RouteComponentProps,
} from "react-router-dom";
import { JournalList } from "@component/journal/JournalList";
import { LedgerList } from "@component/ledger/LedgerList";

const getInitialContextValue = () => {
  return {
    history: (undefined as any) as History,
    nendo: (undefined as any) as string,
    ledgerCd: (undefined as any) as string,
  };
};

export const Context = React.createContext<{
  history: History;
  nendo: string;
  ledgerCd: string;
}>(getInitialContextValue());

export const Main = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          render={(routeProps: RouteComponentProps) => {
            const contextValue = getInitialContextValue();
            return (
              <Context.Provider
                value={Object.assign(contextValue, {
                  history: routeProps.history,
                })}
              >
                <JournalList />
              </Context.Provider>
            );
          }}
        />
        <Route
          exact
          path="/:nendo"
          render={(
            routeProps: RouteComponentProps<{
              nendo: string;
            }>
          ) => {
            const p = routeProps.match.params;
            const contextValue = getInitialContextValue();
            return (
              <Context.Provider
                value={Object.assign(contextValue, {
                  history: routeProps.history,
                  nendo: p.nendo,
                })}
              >
                <JournalList nendo={p.nendo} />
              </Context.Provider>
            );
          }}
        />
        <Route
          exact
          path="/:nendo/:ledgerCd"
          render={(
            routeProps: RouteComponentProps<{
              nendo: string;
              ledgerCd: string;
            }>
          ) => {
            const p = routeProps.match.params;
            return (
              <Context.Provider
                value={{
                  history: routeProps.history,
                  nendo: p.nendo,
                  ledgerCd: p.ledgerCd,
                }}
              >
                <LedgerList nendo={p.nendo} ledgerCd={p.ledgerCd} />
              </Context.Provider>
            );
          }}
        />
      </Switch>
    </BrowserRouter>
  );
};

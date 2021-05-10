import * as React from "react";
import { History } from "history";
import {
  BrowserRouter,
  Route,
  Switch,
  RouteComponentProps,
} from "react-router-dom";
import { Header } from "@component/header/Header";
import { JournalList } from "@component/journal/JournalList";
import { LedgerList } from "@component/ledger/LedgerList";

const getInitialContextValue = () => {
  return {
    history: (undefined as any) as History,
    nendo: (undefined as any) as string,
    showJournal: false,
    showLedger: false,
    ledgerCd: (undefined as any) as string,
  };
};

export const Context = React.createContext<{
  history: History;
  nendo: string;
  showJournal: boolean;
  showLedger: boolean;
  ledgerCd: string;
}>(getInitialContextValue());

export const Main = () => {
  return (
    <div>
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
                  <Header />
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
                  <Header />
                </Context.Provider>
              );
            }}
          />
          <Route
            exact
            path="/:nendo/journal"
            render={(
              routeProps: RouteComponentProps<{
                nendo: string;
                ledgerCd: string;
              }>
            ) => {
              const p = routeProps.match.params;
              const contextValue = getInitialContextValue();
              return (
                <Context.Provider
                  value={Object.assign(contextValue, {
                    history: routeProps.history,
                    nendo: p.nendo,
                    showJournal: true,
                  })}
                >
                  <Header />
                  <hr />
                  <JournalList nendo={p.nendo} />
                </Context.Provider>
              );
            }}
          />
          <Route
            exact
            path="/:nendo/ledger"
            render={(
              routeProps: RouteComponentProps<{
                nendo: string;
                ledgerCd: string;
              }>
            ) => {
              const p = routeProps.match.params;
              const contextValue = getInitialContextValue();
              return (
                <Context.Provider
                  value={Object.assign(contextValue, {
                    history: routeProps.history,
                    nendo: p.nendo,
                    showLedger: true,
                  })}
                >
                  <Header />
                </Context.Provider>
              );
            }}
          />
          <Route
            exact
            path="/:nendo/ledger/:ledgerCd"
            render={(
              routeProps: RouteComponentProps<{
                nendo: string;
                ledgerCd: string;
              }>
            ) => {
              const p = routeProps.match.params;
              const contextValue = getInitialContextValue();
              return (
                <Context.Provider
                  value={Object.assign(contextValue, {
                    history: routeProps.history,
                    nendo: p.nendo,
                    ledgerCd: p.ledgerCd,
                    showJournal: false,
                  })}
                >
                  <Header />
                  <hr />
                  <LedgerList nendo={p.nendo} ledgerCd={p.ledgerCd} />
                </Context.Provider>
              );
            }}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

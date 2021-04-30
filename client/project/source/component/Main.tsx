import * as React from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  RouteComponentProps,
} from "react-router-dom";
import { JournalList } from "@component/journal/JournalList";
import { LedgerList } from "@component/ledger/LedgerList";

export const Main = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return <JournalList />;
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
            return <JournalList nendo={p.nendo} />;
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
            return <LedgerList nendo={p.nendo} ledgerCd={p.ledgerCd} />;
          }}
        />
      </Switch>
    </BrowserRouter>
  );
};

import * as React from "react";
import { History } from "history";
import {
  BrowserRouter,
  Route,
  Switch,
  RouteComponentProps,
} from "react-router-dom";
import { Header, HeaderParams } from "@component/header/Header";
import { JournalList } from "@component/journal/JournalList";
import { LedgerList } from "@component/ledger/LedgerList";
import { updateState, getRestoreValue } from "@component/misc";

const useQuery = () => {
  let query = location.search;
  const queryMap = new Map<string, string>();
  if (query.length <= 1) {
    return queryMap;
  }
  query = query.substr(1);
  const queries = query.split("&");
  for (const q of queries) {
    const qs = q.split("=");
    queryMap.set(qs[0], qs[1]);
  }
  return queryMap;
};

const getInitialContextValue = () => {
  return {
    history: undefined as any as History,
    nendo: undefined as any as string,
    showJournal: false,
    showLedger: false,
    ledgerCd: undefined as any as string,
    journalsOrder: undefined,
    ledgerMonth: undefined,
  };
};

const setUrl =
  (history: History) =>
  (props: {
    nendo: string;
    showJournal?: boolean;
    showLedger?: boolean;
    ledgerCd?: string;
    journalsOrder?: string;
    ledgerMonth?: string;
    pageNo?: number;
    pageSize?: number;
  }) => {
    let showJournal = props.showJournal ?? false;
    let showLedger = props.showLedger ?? false;
    let pageNo = props.pageNo ?? 1;
    let pageSize = props.pageSize ?? 10;
    const url = [];
    if (props.nendo === "") {
      return "/";
    }
    url.push(props.nendo);
    if (showJournal) {
      url.push("journal");
    }
    if (showLedger) {
      url.push("ledger");
    }
    if (props.ledgerCd != null) {
      url.push(props.ledgerCd);
    }
    const query = [];
    if (props.journalsOrder != null) {
      query.push(`journals_order=${props.journalsOrder}`);
    }
    if (props.ledgerMonth != null) {
      query.push(`month=${props.ledgerMonth}`);
    }
    query.push(`page_no=${pageNo}`);
    query.push(`page_size=${pageSize}`);
    const ret = `/${url.join("/")}${
      query.length === 0 ? "" : `?${query.join("&")}`
    }`;
    history.push(ret);
  };

// export interface IContext {
//   history: History;
//   nendo: string;
//   showJournal: boolean;
//   showLedger: boolean;
//   ledgerCd: string;
//   journalsOrder: string | undefined;
//   ledgerMonth: string | undefined;
// }

// export const Context = React.createContext<IContext>(getInitialContextValue());

export const Main = () => {
  const [ledgerMonth, setLedgerMonth] = React.useState(
    undefined as string | undefined
  );
  const [journalsOrder, setJournalsOrder] = React.useState(
    undefined as string | undefined
  );
  const [journalsPageNo, setJournalsPageNo] = React.useState(
    undefined as string | undefined
  );
  const [journalsPageSize, setJournalsPageSize] = React.useState(
    undefined as string | undefined
  );
  const [ledgerPageNo, setLedgerPageNo] = React.useState(
    undefined as string | undefined
  );
  const [ledgerPageSize, setLedgerPageSize] = React.useState(
    undefined as string | undefined
  );

  const defaultHeaderParams: HeaderParams = {
    nendo: undefined,
    showJournal: false,
    journalsOrder: undefined,
    showLedger: false,
    ledgerCd: undefined,
    ledgerMonth: undefined,
  };

  const createHeaderParams = (params: Partial<HeaderParams>) => {
    const newParams: any = {};
    Object.assign(newParams, defaultHeaderParams);
    for (const key of Object.keys(params)) {
      newParams[key] = (params as any)[key];
    }
    return newParams;
  };

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              const params = createHeaderParams({});
              return (
                // <Context.Provider
                //   value={Object.assign(contextValue, {
                //     history: routeProps.history,
                //   })}
                // >
                <Header {...params} />
                // </Context.Provider>
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
              const nendo = p.nendo;
              const params = createHeaderParams({ nendo });
              return (
                // <Context.Provider
                //   value={Object.assign(contextValue, {
                //     history: routeProps.history,
                //     nendo: p.nendo,
                //   })}
                // >
                <Header {...params} />
                // </Context.Provider>
              );
            }}
          />
          <Route
            exact
            path="/:nendo/journal"
            render={(
              routeProps: RouteComponentProps<{
                nendo: string;
              }>
            ) => {
              const p = routeProps.match.params;
              const query = useQuery();
              let order = query.get("journals_order");
              let pageNo = query.get("page_no");
              let pageSize = query.get("page_size");

              let isStateUpdated = false;
              let isUrlRewriteRequired = false;
              const setStateUpdated = () => {
                isStateUpdated = true;
              };
              const setUrlRewriteRequired = () => {
                isUrlRewriteRequired = true;
              };

              const update = updateState(setStateUpdated);
              const get = getRestoreValue(setUrlRewriteRequired);

              update(order, journalsOrder, setJournalsOrder);
              update(pageNo, journalsPageNo, setJournalsPageNo);
              update(pageSize, journalsPageSize, setJournalsPageSize);
              order = get(order, journalsOrder, "0");
              pageNo = get(pageNo, journalsPageNo, "1");
              pageSize = get(pageSize, journalsPageSize, "10");
              if (isUrlRewriteRequired) {
                setUrl(routeProps.history)({
                  nendo: p.nendo,
                  showJournal: true,
                  pageNo: pageNo == null ? undefined : Number(pageNo),
                  pageSize: pageSize == null ? undefined : Number(pageSize),
                  journalsOrder: order,
                });
              }

              if (isStateUpdated || isUrlRewriteRequired) {
                return <></>;
              }

              const nendo = p.nendo;
              const showJournal = true;
              const params = createHeaderParams({
                nendo,
                showJournal,
                journalsOrder,
              });
              return (
                // <Context.Provider
                //   value={Object.assign(contextValue, {
                //     history: routeProps.history,
                //     nendo: p.nendo,
                //     showJournal: true,
                //     journalsOrder: query.get("journals_order"),
                //   })}
                // >
                <>
                  <Header {...params} />
                  <hr />
                  <JournalList
                    nendo={p.nendo}
                    journalsOrder={journalsOrder}
                    pageNo={Number(pageNo)}
                    pageSize={Number(pageSize)}
                  />
                </>
                // </Context.Provider>
              );
            }}
          />
          <Route
            exact
            path="/:nendo/ledger"
            render={(
              routeProps: RouteComponentProps<{
                nendo: string;
              }>
            ) => {
              const p = routeProps.match.params;
              const nendo = p.nendo;
              const showLedger = true;
              const params = createHeaderParams({ nendo, showLedger });
              return (
                // <Context.Provider
                //   value={Object.assign(contextValue, {
                //     history: routeProps.history,
                //     nendo: p.nendo,
                //     showLedger: true,
                //   })}
                // >
                <Header {...params} />
                // </Context.Provider>
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
              const query = useQuery();
              let month = query.get("month");
              let pageNo = query.get("page_no");
              let pageSize = query.get("page_size");

              let isStateUpdated = false;
              let isUrlRewriteRequired = false;
              const setStateUpdated = () => {
                isStateUpdated = true;
              };
              const setUrlRewriteRequired = () => {
                isUrlRewriteRequired = true;
              };

              const update = updateState(setStateUpdated);
              const get = getRestoreValue(setUrlRewriteRequired);

              update(month, ledgerMonth, setLedgerMonth);
              update(pageNo, ledgerPageNo, setLedgerPageNo);
              update(pageSize, ledgerPageSize, setLedgerPageSize);
              month = get(month, ledgerMonth, "all");
              pageNo = get(pageNo, ledgerPageNo, "1");
              pageSize = get(pageSize, ledgerPageSize, "10");
              if (isUrlRewriteRequired) {
                setUrl(routeProps.history)({
                  nendo: p.nendo,
                  showLedger: true,
                  ledgerCd: p.ledgerCd,
                  ledgerMonth: month,
                  pageNo: pageNo == null ? undefined : Number(pageNo),
                  pageSize: pageSize == null ? undefined : Number(pageSize),
                });
              }

              if (isStateUpdated || isUrlRewriteRequired) {
                return <></>;
              }
              const nendo = p.nendo;
              const showLedger = true;
              const ledgerCd = p.ledgerCd;
              const params = createHeaderParams({
                nendo,
                showLedger,
                ledgerCd,
                ledgerMonth: month,
              });
              return (
                // <Context.Provider
                //   value={Object.assign(contextValue, {
                //     history: routeProps.history,
                //     nendo: p.nendo,
                //     ledgerCd: p.ledgerCd,
                //     showLedger: true,
                //     ledgerMonth: query.get("month"),
                //   })}
                // >
                <>
                  <Header {...params} />
                  <hr />
                  <LedgerList
                    nendo={p.nendo}
                    ledgerCd={p.ledgerCd}
                    ledgerMonth={month}
                    pageNo={Number(pageNo)}
                    pageSize={Number(pageSize)}
                  />
                </>
                // </Context.Provider>
              );
            }}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

import * as React from "react";
import { History } from "history";
import {
  BrowserRouter,
  NavigateFunction,
  Route,
  Routes,
  useNavigate,
  useParams
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
  (history: NavigateFunction) =>
  (props: {
    nendo: string | undefined;
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
    history(ret);
  };

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

  const X = () => {
    const params = createHeaderParams({});
    return (
      <Header {...params} />
    );
  };

  const Y = () => {
    const { nendo } =  useParams();
    const params = createHeaderParams({ nendo });
    return (
      <Header {...params} />
    );
  }

  const Z = () => {
    const { nendo } = useParams();
    const nav = useNavigate();
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
      setUrl(nav)({
        nendo,
        showJournal: true,
        pageNo: pageNo == null ? undefined : Number(pageNo),
        pageSize: pageSize == null ? undefined : Number(pageSize),
        journalsOrder: order,
      });
    }

    if (isStateUpdated || isUrlRewriteRequired) {
      return <></>;
    }

    const showJournal = true;
    const params = createHeaderParams({
      nendo,
      showJournal,
      journalsOrder,
    });
    return (
      <>
        <Header {...params} />
        <hr />
        <JournalList
          nendo={nendo ?? ""}
          journalsOrder={journalsOrder}
          pageNo={Number(pageNo)}
          pageSize={Number(pageSize)}
        />
      </>
    );
  }

  const A = () => {
    const { nendo } = useParams();
    const showLedger = true;
    const params = createHeaderParams({ nendo, showLedger });
    return (
      <Header {...params} />
    );
  }

  const B = () => {
    const { nendo, ledgerCd } = useParams();
    const nav = useNavigate();
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
      setUrl(nav)({
        nendo: nendo,
        showLedger: true,
        ledgerCd,
        ledgerMonth: month,
        pageNo: pageNo == null ? undefined : Number(pageNo),
        pageSize: pageSize == null ? undefined : Number(pageSize),
      });
    }

    if (isStateUpdated || isUrlRewriteRequired) {
      return <></>;
    }
    const showLedger = true;
    const params = createHeaderParams({
      nendo,
      showLedger,
      ledgerCd,
      ledgerMonth: month,
    });
    return (
      <>
        <Header {...params} />
        <hr />
        <LedgerList
          nendo={nendo??""}
          ledgerCd={ledgerCd??""}
          ledgerMonth={month}
          pageNo={Number(pageNo)}
          pageSize={Number(pageSize)}
        />
      </>
    );
  };

  return (
    <div className="main">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<X />} />
          <Route path="/:nendo" element={<Y />} />
          <Route path="/:nendo/journal" element={<Z />} />
          <Route path="/:nendo/ledger" element={<A />} />
          <Route path="/:nendo/ledger/:ledgerCd" element={<B />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

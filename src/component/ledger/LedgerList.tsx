import * as React from "react";
import { useSelector } from "typeless";
import flatmap from "lodash.flatmap";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, useState, actions } from "src/module/action";
import { LedgerListRow } from "src/component/ledger/LedgerListRow";
import { LedgerListNewRow } from "src/component/ledger/LedgerListNewRow";
import {
  LedgerListInputErrors,
  LedgerListInputErrorItem,
  SetLedgerListInputError,
  LedgerListError,
} from "src/component/ledger/LedgerListError";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { useHistory } from "react-router";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { getPageList } from "src/component/misc";
import { selectSaimokuMap } from "src/module/selector/selectSaimokuMap";

export const LedgerList = (props: {
  nendo: string;
  ledgerCd: string;
  ledgerMonth?: string;
  pageNo: number;
  pageSize: number;
}) => {
  const history = useHistory();
  const { loadLedger } = useActions();
  const state = useState();
  const saimokuMap = useSelector(selectSaimokuMap);

  const [errors, setErrors] = React.useState(
    new Map() as LedgerListInputErrors
  );

  React.useEffect(() => {
    loadLedger(
      new LedgerSearchRequest({
        nendo: props.nendo,
        ledger_cd: props.ledgerCd,
        month: props.ledgerMonth,
        page_no: props.pageNo,
        page_size: props.pageSize,
      })
    );
  }, [props]);

  const ledgerListRows: (
    | { isNewRow: true; journal_id: number }
    | LedgerSearchResponse
  )[] = [{ isNewRow: true, journal_id: -1 }, ...state.ledgerList.list];

  const pageInfo = getPageList(
    props.pageNo,
    state.ledgerList.all_count,
    props.pageSize
  );
  return (
    <div className="ledgerList">
      <h1 className="subTitle">
        台帳:
        {saimokuMap.get(props.ledgerCd)?.saimoku_full_name}
        {props.ledgerMonth !== "all" ? ` - ${props.ledgerMonth}月分 ` : ""}
      </h1>
      <LedgerListError errors={errors} />
      <div>
        <span className="pageSummary">
          {`${pageInfo.from}-${pageInfo.to}`}件(全
          {state.ledgerList.all_count ?? "0"}件)
        </span>
        <span className="pageList">
          {pageInfo.pageList.map((pageNo) =>
            pageNo === props.pageNo ? (
              <a className="pageNo">{pageNo}</a>
            ) : (
              <a
                onClick={() => {
                  const url = new URL(location.href);
                  url.searchParams.set("page_no", `${pageNo}`);
                  history.push(`${url.pathname}${url.search}`);
                }}
                className={`pageNo ${
                  pageNo !== props.pageNo ? "clickable" : ""
                }`}
              >
                {pageNo}
              </a>
            )
          )}
        </span>
      </div>
      <div className="ledgerList">
        <table>
          <thead className="ledgerHeader">
            <tr>
              <th className="ledgerHeader-date">登録日</th>
              <th className="ledgerHeader-anotherCd" colSpan={2}>
                相手科目
              </th>
              <th className="ledgerHeader-karikataValue">金額(借方)</th>
              <th className="ledgerHeader-kasikataValue">金額(貸方)</th>
              <th className="ledgerHeader-note">備考</th>
              <th className="ledgerHeader-acc">累計</th>
              <th className="ledgerHeader-delete">
                <br />
              </th>
            </tr>
          </thead>
          <tbody className="ledgerBody">
            {ledgerListRows.map((row) => {
              let error: LedgerListInputErrorItem = {};
              if (errors.has(`${row.journal_id}`)) {
                error = errors.get(`${row.journal_id}`) ?? {};
              }
              const setError: SetLedgerListInputError = (key, errorInfo) => {
                if (errorInfo.hasError) {
                  error = Object.assign({}, error);
                  error[key] = {
                    message: errorInfo.message,
                    targetId: errorInfo.targetId,
                  };
                  errors.set(`${row.journal_id}`, error);
                } else {
                  error = Object.assign({}, error);
                  delete error[key];
                  errors.set(`${row.journal_id}`, error);
                  if (Object.keys(error).length === 0) {
                    errors.delete(`${row.journal_id}`);
                  }
                }
              };
              const notifyError = () => {
                setErrors(new Map(errors));
              };
              if ("isNewRow" in row) {
                return (
                  <LedgerListNewRow
                    key={row.journal_id}
                    nendo={props.nendo}
                    ledgerCd={props.ledgerCd}
                    ledgerMonth={props.ledgerMonth}
                    pageNo={props.pageNo}
                    pageSize={props.pageSize}
                    error={error}
                    setError={setError}
                    notifyError={notifyError}
                  />
                );
              } else {
                return (
                  <LedgerListRow
                    key={row.journal_id}
                    nendo={props.nendo}
                    ledgerCd={props.ledgerCd}
                    ledgerMonth={props.ledgerMonth}
                    pageNo={props.pageNo}
                    pageSize={props.pageSize}
                    ledger={row}
                    error={error}
                    setError={setError}
                    notifyError={notifyError}
                  />
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const toNumber = (s: string | undefined) => {
  if (s == null) {
    return null;
  }
  if (s.length === 0) {
    return null;
  }
  return Numeral(s).value();
};

export const toRawDate = (dateStr: string) => {
  const date1 = DateTime.fromFormat(dateStr, "yyyymmdd");
  const date2 = DateTime.fromFormat(dateStr, "yyyy/mm/dd");
  if (date1.invalidReason == null) {
    return dateStr;
  }
  if (date2.invalidReason == null) {
    return date2.toFormat("yyyymmdd");
  }
  throw new Error();
};

export const filterSaimokuList = (
  saimokuList: SaimokuMasterEntity[],
  cd: string
) => {
  return flatmap(saimokuList, (s) => {
    if (s.saimoku_cd.toLowerCase().startsWith(cd.toLowerCase())) {
      return [s];
    }
    if (s.saimoku_kana_name.toLowerCase().indexOf(cd.toLowerCase()) > -1) {
      return [s];
    }
    return [];
  });
};

// 更新後に必要な処理
// 金額等を更新すると累計金額が全体的に変更されるため全データを取り直す必要がある。
export const createReloadLedger =
  (
    nendo: string,
    ledgerCd: string,
    ledgerMonth: string | undefined,
    pageNo: number,
    pageSize: number
  ) =>
  (needClear?: boolean) => {
    const ret = [];
    if (needClear) {
      // 日付を変更する場合、データの並び順が変わってしまうがその場合、
      // 再描画で行が重複してしまう(※原因要調査)ため事前にクリア処理をする。
      // ただしクリアするとフォーカスを失う模様。
      ret.push(actions.setLedger({ all_count: 0, list: [] }));
    }
    ret.push(
      actions.loadLedger(
        new LedgerSearchRequest({
          nendo: nendo,
          ledger_cd: ledgerCd,
          month: ledgerMonth,
          page_no: pageNo,
          page_size: pageSize,
        })
      )
    );
    return ret;
  };

export const getTargetYYYYMM = (dateStr: string) => {
  const date = DateTime.fromFormat(dateStr, "yyyymmdd");
  let nendoStr = date.toFormat("yyyy");
  const mmStr = date.toFormat("mm");
  if ([1, 2, 3].includes(Number(mmStr))) {
    nendoStr = `${Number(nendoStr) + 1}`;
  }
  return `${nendoStr}/${mmStr}`;
};

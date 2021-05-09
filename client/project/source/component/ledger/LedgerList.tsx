import * as React from "react";
import flatmap from "lodash.flatmap";
import { DateTime } from "luxon";
import { useActions, useState } from "@module/action";
import { Header } from "@component/header/Header";
import { LedgerListRow } from "@component/ledger/LedgerListRow";
import { LedgerListNewRow } from "@component/ledger/LedgerListNewRow";
import {
  LedgerListInputErrors,
  LedgerListInputErrorItem,
  SetLedgerListInputError,
  LedgerListError,
} from "@component/ledger/LedgerListError";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";

export const LedgerList = (props: { nendo: string; ledgerCd: string }) => {
  const { loadLedger } = useActions();
  const state = useState();
  const [errors, setErrors] = React.useState(
    new Map() as LedgerListInputErrors
  );

  React.useEffect(() => {
    loadLedger({ nendo: props.nendo, ledger_cd: props.ledgerCd });
  }, [props]);

  const ledgerListRows: (
    | { isNewRow: true; journal_id: number }
    | LedgerSearchResponse
  )[] = [{ isNewRow: true, journal_id: -1 }, ...state.ledgerList];

  return (
    <div>
      <Header />
      <hr />
      <LedgerListError errors={errors} />
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
                    error={error}
                    setError={setError}
                    notifyError={notifyError}
                  />
                );
              } else {
                return (
                  <LedgerListRow
                    key={row.journal_id}
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
  return Number(s);
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

import * as React from "react";
import { useActions, useState } from "@module/action";
import { Header } from "@component/header/Header";
import { LedgerListRow } from "@component/ledger/LedgerListRow";
import {
  LedgerListInputErrors,
  LedgerListInputErrorItem,
  SetLedgerListInputError,
  LedgerListError,
} from "@component/ledger/LedgerListError";

export const LedgerList = (props: { nendo: string; ledgerCd: string }) => {
  const { loadLedger } = useActions();
  const state = useState();
  const [errors, setErrors] = React.useState(
    new Map() as LedgerListInputErrors
  );

  React.useEffect(() => {
    loadLedger({ nendo: props.nendo, ledger_cd: props.ledgerCd });
  }, [props]);

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
              <th className="ledgerHeader-anotherCd">相手科目</th>
              <th className="ledgerHeader-karikataValue">金額(借方)</th>
              <th className="ledgerHeader-kasikataValue">金額(貸方)</th>
              <th className="ledgerHeader-acc">累計</th>
              <th className="ledgerHeader-note">備考</th>
            </tr>
          </thead>
          <tbody className="ledgerBody">
            {state.ledgerList.map((row) => {
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
              return (
                <LedgerListRow
                  key={row.journal_id}
                  ledger={row}
                  error={error}
                  setError={setError}
                  notifyError={notifyError}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

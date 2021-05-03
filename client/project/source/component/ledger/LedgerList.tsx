import * as React from "react";
import { useActions, useState } from "@module/action";
import { Header } from "@component/header/Header";
import { LedgerListRow } from "@component/ledger/LedgerListRow";

export const LedgerList = (props: { nendo: string; ledgerCd: string }) => {
  const { loadLedger } = useActions();
  const state = useState();
  React.useEffect(() => {
    loadLedger({ nendo: props.nendo, target_cd: props.ledgerCd });
  }, [props]);
  return (
    <div>
      <Header />
      <hr />
      <div>
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
              return <LedgerListRow key={row.date} ledger={row} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import * as React from "react";
import { useActions, useState } from "@module/action";

export const Main = () => {
  const { loadInit } = useActions();
  const state = useState();
  React.useEffect(() => {
    loadInit();
  }, []);
  return (
    <div>
      <div>
        <label>
          年度:
          <select>
            <option></option>
            {state.nendoList.map((n) => {
              return <option key={n.nendo}>{n.nendo}</option>;
            })}
          </select>
        </label>
      </div>
      <div>
        <label>
          <input type="radio" id="journal" value="journal" />
          仕訳帳
        </label>
        <label>
          <input type="radio" id="ledger" value="ledger" />
          出納帳
        </label>
        <select>
          <option></option>
          <option>ゆうちょ銀行</option>
          <option>消耗品費</option>
        </select>
      </div>
      <hr />
      <div>
        <table>
          <thead>
            <tr>
              <th>科目</th>
              <th>金額(借方)</th>
              <th>金額(貸方)</th>
              <th>累計</th>
              <th>備考</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

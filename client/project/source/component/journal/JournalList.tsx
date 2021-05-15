import * as React from "react";
import { useSelector } from "typeless";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
import { Context } from "@component/Main";
import {
  IJournalSearchRequest,
  JournalSearchRequest,
} from "@common/model/journal/JournalSearchRequest";

export const JournalList = (props: { nendo: string }) => {
  const { loadJournals } = useActions();
  const { journalList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);
  const context = React.useContext(Context);
  React.useEffect(() => {
    const request: Partial<IJournalSearchRequest> = { nendo: context.nendo };
    if (context.journalsOrder != null) {
      if (context.journalsOrder === "1") {
        request.latest_order = true;
      } else if (context.journalsOrder === "2") {
        request.largest_order = true;
      } else if (context.journalsOrder === "3") {
        request.largest_order = false;
      }
    }
    loadJournals(new JournalSearchRequest(request));
  }, [context.journalsOrder]);
  return (
    <div>
      <table>
        <thead className="journalHeader">
          <th>日付</th>
          <th>借方科目</th>
          <th>借方金額</th>
          <th>貸方科目</th>
          <th>貸方金額</th>
          <th>備考</th>
          <th>更新日時</th>
        </thead>
        <tbody className="journalBody">
          {journalList.map((j) => {
            return (
              <tr key={j.id}>
                <td className="journalBody-date">
                  {DateTime.fromFormat(j.date, "yyyymmdd").toFormat(
                    "yyyy/mm/dd"
                  )}
                </td>
                <td className="journalBody-cd">
                  {j.karikata_cd}:
                  {saimokuMap.get(j.karikata_cd)?.saimoku_ryaku_name}
                </td>
                <td className="journalBody-value num">
                  {Numeral(j.karikata_value).format("0,0")}
                </td>
                <td className="journalBody-cd">
                  {j.kasikata_cd}:
                  {saimokuMap.get(j.kasikata_cd)?.saimoku_ryaku_name}
                </td>
                <td className="journalBody-value num">
                  {Numeral(j.kasikata_value).format("0,0")}
                </td>
                <td className="journalBody-note">{j.note}</td>
                <td>
                  {j.updated_at == null
                    ? ""
                    : DateTime.fromISO(j.updated_at).toFormat(
                        "yyyy/MM/dd HH:mm:ss"
                      )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

import * as React from "react";
import { useSelector } from "typeless";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, useState } from "src/module/action";
import { selectSaimokuMap } from "src/module/selector/selectSaimokuMap";
import {
  IJournalSearchRequest,
  JournalSearchRequest,
} from "@common/model/journal/JournalSearchRequest";
import { getPageList } from "src/component/misc";
import { useHistory } from "react-router";

export const JournalList = (props: {
  nendo: string;
  journalsOrder?: string;
  pageNo: number;
  pageSize: number;
}) => {
  const history = useHistory();
  const { loadJournals } = useActions();
  const { journalList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);

  React.useEffect(() => {
    const request: Partial<IJournalSearchRequest> = { nendo: props.nendo };
    if (props.journalsOrder != null) {
      if (props.journalsOrder === "1") {
        request.latest_order = true;
      } else if (props.journalsOrder === "2") {
        request.largest_order = true;
      } else if (props.journalsOrder === "3") {
        request.largest_order = false;
      }
    }
    request.page_no = props.pageNo;
    request.page_size = props.pageSize;
    loadJournals(new JournalSearchRequest(request));
  }, [props]);

  const pageInfo = getPageList(
    props.pageNo,
    journalList.all_count,
    props.pageSize
  );
  return (
    <div className="journalList">
      <h1 className="subTitle">仕訳一覧</h1>
      <div>
        <span className="pageSummary">
          {`${pageInfo.from}-${pageInfo.to}`}件(全
          {journalList.all_count ?? "0"}件)
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
          {journalList.list.map((j) => {
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

import * as React from "react";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";

export const PL = (props: { nendo: string }) => {
  const { loadSummary } = useActions();
  const { summary } = useState();
  React.useEffect(() => {
    loadSummary({ nendo: props.nendo });
  }, [props.nendo]);
  return (
    <div className="pl">
      <h1>損益計算書</h1>
      <div>(自 令和 2 年4月1日 至 令和 3 年3月31日)</div>
      <div style={{ textAlign: "right", marginRight: "10px" }}>(単位：円)</div>
      <div style={{ display: "inline-block", marginLeft: "50px" }}>
        <table>
          <thead>
            <tr>
              <th className="row1">科目</th>
              <th colSpan={2}>金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="emp">売上高</th>
              <td className="row2-1"></td>
              <td className="row2-2">{Numeral(summary.sales).format("0,0")}</td>
            </tr>
            <tr>
              <th>売上原価</th>
              <td></td>
              <td className="sep">0</td>
            </tr>
            <tr>
              <th>売上総利益</th>
              <td></td>
              <td>{Numeral(summary.sales).format("0,0")}</td>
            </tr>
            <tr>
              <th>販売費及び一般管理費</th>
              <td></td>
              <td className="sep">{Numeral(summary.expenses).format("0,0")}</td>
            </tr>
            <tr>
              <th>営業利益</th>
              <td></td>
              <td>{Numeral(summary.sales - summary.expenses).format("0,0")}</td>
            </tr>
            <tr>
              <th>営業外収益</th>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <th>受取利息</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>受取配当金</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>為替差益</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>その他</th>
              <td className="sep">0</td>
              <td>0</td>
            </tr>
            <tr>
              <th>営業外費用</th>
              <td>
                <br />
              </td>
              <td></td>
            </tr>
            <tr>
              <th>支払利息</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>たな卸資産評価損</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>為替差損</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>その他</th>
              <td className="sep">0</td>
              <td className="sep">0</td>
            </tr>
            <tr>
              <th>経常利益</th>
              <td></td>
              <td>{Numeral(summary.sales - summary.expenses).format("0,0")}</td>
            </tr>
            <tr>
              <th>特別利益</th>
              <td>
                <br />
              </td>
              <td></td>
            </tr>
            <tr>
              <th>固定資産売却益</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>前期損益修正益</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>賞与引当金戻入額</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>製品保証引当金戻入額</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>その他</th>
              <td className="sep">0</td>
              <td>0</td>
            </tr>
            <tr>
              <th>特別損失</th>
              <td>
                <br />
              </td>
              <td></td>
            </tr>
            <tr>
              <th>前期損益修正損</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>固定資産除売却損</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>貸倒引当金繰入額</th>
              <td>0</td>
              <td></td>
            </tr>
            <tr>
              <th>その他</th>
              <td className="sep">0</td>
              <td>0</td>
            </tr>
            <tr>
              <th>税引前当期純利益</th>
              <td>
                <br />
              </td>
              <td>{Numeral(summary.sales - summary.expenses).format("0,0")}</td>
            </tr>
            <tr>
              <th>法人税、住民税及び事業税</th>
              <td>0</td>
              <td>
                {summary.tax == null ? "0" : Numeral(231400).format("0,0")}
              </td>
            </tr>
            <tr>
              <th>法人税等調整額</th>
              <td className="sep">0</td>
              <td className="sep">0</td>
            </tr>
            <tr>
              <th>当期純利益</th>
              <td>
                <br />
              </td>
              <td>
                {Numeral(
                  summary.sales -
                    summary.expenses -
                    (summary.tax == null ? 0 : 231400)
                ).format("0,0")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

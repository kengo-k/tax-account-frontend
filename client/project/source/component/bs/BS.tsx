import * as React from "react";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";

export const BS = (props: { nendo: string }) => {
  const { loadSummary } = useActions();
  const { summary } = useState();
  React.useEffect(() => {
    loadSummary({ nendo: props.nendo });
  }, [props.nendo]);

  const tax = 231400;
  const azukari = 25260;
  const debt_sum = tax + azukari;

  const capital = 100000;
  const pre_rieki = 3518597; // 前年の繰越利益剰余金
  const profit = 513882; // 当期純利益
  const net_sum = capital + pre_rieki + profit;

  const cash = 1127465;
  const urikake = 825000;
  const kasi_roan = debt_sum + net_sum - cash - urikake;
  const asset_sum = cash + urikake + kasi_roan;

  return (
    <div className="bs">
      <h1>貸借対照表</h1>
      <div>(自 令和 2 年4月1日 至 令和 3 年3月31日)</div>
      <div style={{ textAlign: "right", marginRight: "10px" }}>(単位：円)</div>
      <div className="part left">
        <table>
          <thead>
            <tr>
              <th className="row1">科目</th>
              <th className="row2">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="">(資産の部)</th>
              <td className="">円</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">流動資産</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">現金及び預金</th>
              <td className="">{f(cash)}</td>
            </tr>
            <tr>
              <th className="">受取手形</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">売掛金</th>
              <td className="">{f(urikake)}</td>
            </tr>
            <tr>
              <th className="">商品</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">部品</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">前払費用</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">繰延税金資産</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">短期貸付金</th>
              <td className="">{f(kasi_roan)}</td>
            </tr>
            <tr>
              <th className="">未収入金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">貸倒引当金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">固定資産</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level2">有形固定資産</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">建物</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">構築物</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">機械及び装置</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">車両及び運搬具</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">工具、器具及び備品</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">土地</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">建設仮勘定</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level2">無形固定資産</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">施設利用権</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">ソフトウェア</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level2">投資その他の資産</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">投資有価証券</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">関係会社株式</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">関係会社出資金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">長期貸付金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">長期前払費用</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">貸倒引当金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr className="sum">
              <th className="">資産合計</th>
              <td className="">{f(asset_sum)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="part right">
        <table>
          <thead>
            <tr>
              <th className="row1">科目</th>
              <th className="row2">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="">(負債の部)</th>
              <td className="">円</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">流動負債</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">買掛金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">短期借入金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">未払金</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">未払費用</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">未払法人税等</th>
              <td className="">{f(tax)}</td>
            </tr>
            <tr>
              <th className="">預り金</th>
              <td className="">{f(azukari)}</td>
            </tr>
            <tr>
              <th className="">賞与引当金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">製品保証引当金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">固定負債</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">退職給付引当金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">繰延税金負債</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr className="sum">
              <th className="">負債合計</th>
              <td className="">{f(debt_sum)}</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">(純資産の部)</th>
              <td className="">円</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">株主資本</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">資本金</th>
              <td className="">{f(capital)}</td>
            </tr>
            <tr>
              <th className="level2">資本剰余金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">資本準備金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">その他資本剰余金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level2">利益剰余金</th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="">その他利益剰余金</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="">繰越利益剰余金</th>
              <td className="">{f(pre_rieki + profit)}</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level2">自己株式</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className=""></th>
              <td className=""></td>
            </tr>
            <tr>
              <th className="level1">評価・換算差額等</th>
              <td className="">0</td>
            </tr>
            <tr>
              <th className="level2">その他有価証券評価差額金</th>
              <td className="">0</td>
            </tr>
            <tr className="sum">
              <th className="">純資産合計</th>
              <td className="">{f(net_sum)}</td>
            </tr>
            <tr className="sum">
              <th className="">負債・純資産合計</th>
              <td className="">{f(net_sum + debt_sum)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const f = (value: number) => {
  return Numeral(value).format("0,0");
};

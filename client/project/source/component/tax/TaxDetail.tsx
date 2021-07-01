import * as React from "react";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";

const f = (value: number) => Numeral(value).format("0,0");

const tr = (unit: number) => (num: number) => {
  return Math.trunc(num / unit) * unit;
};

const tr1000 = tr(1000);
const tr100 = tr(100);

export const TaxDetail = (props: { nendo: string }) => {
  const { loadSummary } = useActions();
  const { summary } = useState();
  React.useEffect(() => {
    loadSummary({ nendo: props.nendo });
  }, [props.nendo]);
  // 法人税
  const preBizTax = 0; // TODO
  const coTaxBase = summary.sales - summary.expenses - preBizTax;
  const under800 = coTaxBase >= 8000000 ? 8000000 : coTaxBase;
  const over800 = coTaxBase - under800 > 0 ? coTaxBase - under800 : 0;
  const coTax = tr1000(under800) * 0.15 + tr1000(over800) * 0.232;
  const fixedCoTax = tr100(coTax);

  // 地方法人税
  const locoTaxBase = tr1000(fixedCoTax);
  const locoTax = locoTaxBase * 0.044;
  const fixedLocoTax = tr100(locoTax);

  // 法人事業税
  const bizTaxBase = tr1000(coTaxBase);
  const bizTax = bizTaxBase * 0.035;
  const fixedBizTax = tr100(bizTax);

  // 地方法人特別税
  const loSpecialTaxBase = fixedBizTax;
  const loSpecialTax = loSpecialTaxBase * 0.432;
  const fixedLoSpecialTax = tr100(loSpecialTax);

  // 法人都民税
  const muniTaxBase = tr1000(fixedCoTax);
  const muniTax = muniTaxBase * 0.07;
  const fixedMuniTax = tr100(muniTax);

  const totalTax =
    fixedCoTax +
    fixedLocoTax +
    fixedBizTax +
    fixedLoSpecialTax +
    fixedMuniTax +
    70000;

  if (summary.tax == null) {
    return <></>;
  }
  return (
    <div className="tax_detail">
      <h1>各種税額の詳細</h1>
      <h2 className="subTitle">法人税</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th>
                <span className="itemNo">1</span>基準額(所得金額)
              </th>
              <td> = 売上-経費総額-前年度事業税額</td>
            </tr>
            <tr>
              <th></th>
              <td>
                = {f(summary.sales)} - {f(summary.expenses)} - 0
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(summary.tax.income)}</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">2</span>800万以下部分
              </th>
              <td>
                = {f(tr1000(under800))}
                (※1000円未満切り捨て) * 15%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(tr1000(under800) * 0.15)}</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">3</span>800万超部分
              </th>
              <td>
                = {f(tr1000(over800))}
                (※1000円未満切り捨て) * 23.2%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(tr1000(over800) * 0.232)}</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">4</span>法人税額
              </th>
              <td>
                = <span className="itemNo">2</span> +{" "}
                <span className="itemNo">3</span>
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(coTax)}</td>
            </tr>
            <tr>
              <th></th>
              <td>
                = <span className="fixed">{f(fixedCoTax)}</span>
                (※100円未満切り捨て)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="subTitle">地方法人税</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th>
                <span className="itemNo">5</span>基準額(法人税額)
              </th>
              <td>
                = <span className="itemNo">4</span>
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(locoTaxBase)}(※1000円未満切り捨て)</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">6</span>地方法人税額
              </th>
              <td>
                = <span className="itemNo">5</span> * 4.4%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(locoTax)}</td>
            </tr>
            <tr>
              <th></th>
              <td>
                = <span className="fixed">{f(fixedLocoTax)}</span>
                (※100円未満切り捨て)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="subTitle">法人事業税</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th>
                <span className="itemNo">7</span>基準額(所得金額)
              </th>
              <td>
                = <span className="itemNo">1</span>
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(bizTaxBase)}(※1000円未満切り捨て)</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">8</span>法人事業税額
              </th>
              <td>
                = <span className="itemNo">7</span> * 3.5%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(bizTax)}</td>
            </tr>
            <tr>
              <th></th>
              <td>
                = <span className="fixed">{f(fixedBizTax)}</span>
                (※100円未満切り捨て)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="subTitle">地方法人特別税</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th>
                <span className="itemNo">9</span>基準額(法人事業税額)
              </th>
              <td>
                = <span className="itemNo">8</span>
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(loSpecialTaxBase)}</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">10</span>地方法人特別税額
              </th>
              <td>
                = <span className="itemNo">9</span> * 43.2%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(loSpecialTax)}</td>
            </tr>
            <tr>
              <th></th>
              <td>
                = <span className="fixed">{f(fixedLoSpecialTax)}</span>
                (※100円未満切り捨て)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 className="subTitle">法人都民税</h2>
      <div>
        <table>
          <tbody>
            <tr>
              <th>
                <span className="itemNo">11</span>基準額(法人税額)
              </th>
              <td>
                = <span className="itemNo">4</span>
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(muniTaxBase)}(※1000円未満切り捨て)</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">12</span>法人都民税・法人税割
              </th>
              <td>
                = <span className="itemNo">11</span> * 7.0%
              </td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(muniTax)}</td>
            </tr>
            <tr>
              <th></th>
              <td>= {f(fixedMuniTax)}(※100円未満切り捨て)</td>
            </tr>
            <tr>
              <th>
                <span className="itemNo">13</span>法人都民税額
              </th>
              <td>
                = <span className="itemNo">12</span> + {f(70000)}(※均等割額)
              </td>
            </tr>
            <tr>
              <th></th>
              <td>
                = <span className="fixed">{f(fixedMuniTax + 70000)}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="totalTax">
        合計納税額: <span>{f(totalTax)}</span>
      </div>
    </div>
  );
};

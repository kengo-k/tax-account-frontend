import * as React from "react";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";
import { Context } from "@component/Main";

export const Header = () => {
  // load initial data
  const { loadInit, loadSummary, setTmpLedgerCd } = useActions();
  const context = React.useContext(Context);
  const state = useState();

  const [journalChecked, setJournalChecked] = React.useState(
    context.showJournal
  );
  const [ledgerChecked, setLedgerChecked] = React.useState(
    context.ledgerCd != null
  );
  const [ledgerCd, setLedgerCd] = React.useState(context.ledgerCd);
  const [journalsOrder, setJournalsOrder] = React.useState(
    undefined as string | undefined
  );
  const journalRef = React.createRef<HTMLInputElement>();
  const ledgerRef = React.createRef<HTMLInputElement>();
  const ledgerCdSelectRef = React.createRef<HTMLSelectElement>();

  const createUrl = (props: {
    nendo: string | undefined;
    showJournal: boolean;
    showLedger: boolean;
    ledgerCd: string | undefined;
    journalsOrder: string | undefined;
  }): string => {
    const url = [];
    if (props.nendo === "") {
      return "/";
    }
    url.push(props.nendo);
    if (props.showJournal) {
      url.push("journal");
    }
    if (props.showLedger) {
      url.push("ledger");
    }
    if (props.ledgerCd != null) {
      url.push(props.ledgerCd);
    }
    const query = [];
    if (props.journalsOrder != null) {
      query.push(`journals_order=${props.journalsOrder}`);
    }
    const ret = `/${url.join("/")}${
      query.length === 0 ? "" : `?${query.join("&")}`
    }`;
    return ret;
  };

  React.useEffect(() => {
    loadInit();
  }, []);

  React.useEffect(() => {
    if (context.ledgerCd != null) {
      setTmpLedgerCd(context.ledgerCd);
    }
  }, [context.ledgerCd]);

  React.useEffect(() => {
    if (context.nendo != null) {
      loadSummary({ nendo: context.nendo });
    }
  }, [context.nendo]);

  React.useEffect(() => {
    if (context.journalsOrder != null) {
      setJournalsOrder(context.journalsOrder);
    }
  }, [context.journalsOrder]);

  return (
    <>
      <div className="mainHeaderRoot">
        <h1 className="subTitle">帳票選択</h1>
        <div className="mainHeader">
          <label>
            年度:
            <select
              value={context.nendo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                context.history.push(
                  createUrl({
                    nendo: e.target.value,
                    ledgerCd: undefined,
                    showJournal: false,
                    showLedger: false,
                    journalsOrder: undefined,
                  })
                );
              }}
            >
              <option></option>
              {state.nendoList.map((n) => {
                return <option key={n.nendo}>{n.nendo}</option>;
              })}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              name="displayType"
              id="journal"
              value="journal"
              checked={journalChecked}
              onClick={() => {
                if (journalRef.current?.checked) {
                  setJournalChecked(true);
                  setLedgerChecked(false);
                  context.history.push(
                    createUrl({
                      nendo: context.nendo,
                      ledgerCd: undefined,
                      showJournal: true,
                      showLedger: false,
                      journalsOrder: undefined,
                    })
                  );
                } else {
                  setJournalChecked(false);
                  context.history.push(
                    createUrl({
                      nendo: context.nendo,
                      ledgerCd: undefined,
                      showJournal: false,
                      showLedger: false,
                      journalsOrder: undefined,
                    })
                  );
                }
              }}
              ref={journalRef}
              disabled={context.nendo == null}
            />
            仕訳帳
          </label>
          <label>
            <input
              type="checkbox"
              name="displayType"
              id="ledger"
              value="ledger"
              checked={ledgerChecked}
              onClick={() => {
                if (ledgerRef.current?.checked) {
                  setLedgerChecked(true);
                  setJournalChecked(false);
                  if (ledgerCd != null) {
                    context.history.push(
                      createUrl({
                        nendo: context.nendo,
                        ledgerCd: ledgerCd,
                        showJournal: false,
                        showLedger: true,
                        journalsOrder: undefined,
                      })
                    );
                  } else {
                    context.history.push(
                      createUrl({
                        nendo: context.nendo,
                        ledgerCd: undefined,
                        showJournal: false,
                        showLedger: true,
                        journalsOrder: undefined,
                      })
                    );
                  }
                } else {
                  setLedgerChecked(false);
                  context.history.push(
                    createUrl({
                      nendo: context.nendo,
                      ledgerCd: undefined,
                      showJournal: false,
                      showLedger: false,
                      journalsOrder: undefined,
                    })
                  );
                }
              }}
              ref={ledgerRef}
              disabled={context.nendo == null}
            />
            出納帳
          </label>
          <select
            value={state.tmpLedgerCd}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setLedgerCd(e.target.value);
              setTmpLedgerCd(e.target.value);
              context.history.push(
                createUrl({
                  nendo: context.nendo,
                  ledgerCd: e.target.value,
                  showJournal: false,
                  showLedger: true,
                  journalsOrder: undefined,
                })
              );
            }}
            disabled={!ledgerChecked}
            ref={ledgerCdSelectRef}
          >
            <option></option>
            {state.saimokuList.map((s) => {
              return (
                <option key={s.saimoku_cd} value={s.saimoku_cd}>
                  {s.saimoku_ryaku_name}
                </option>
              );
            })}
          </select>
          <div className="mainHeader-warning">
            {context.showLedger && context.ledgerCd == null ? (
              <span>台帳コードを選択してください</span>
            ) : (
              <></>
            )}
          </div>
          {context.showJournal ? (
            <div className="journalSearchOption">
              <hr />
              表示順:
              <select
                value={journalsOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  setJournalsOrder(value);
                  context.history.push(
                    createUrl({
                      nendo: context.nendo,
                      ledgerCd: undefined,
                      showJournal: true,
                      showLedger: false,
                      journalsOrder: value,
                    })
                  );
                }}
              >
                <option></option>
                <option value="1">更新日/降順</option>
                <option value="2">金額/降順</option>
                <option value="3">金額/昇順</option>
              </select>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="summaryHeader">
        <h1 className="subTitle">納税額計算</h1>
        <div className="summaryHeader-base">
          <table>
            <tbody>
              <tr>
                <th>売上計</th>
                <td>{Numeral(state.summary.sales).format("0,0")}</td>
              </tr>
              <tr>
                <th>費用計</th>
                <td>{Numeral(state.summary.expenses).format("0,0")}</td>
              </tr>
              <tr>
                <th></th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="summaryHeader-tax">
          <table>
            <tbody>
              <tr>
                <th>法人税</th>
                <td>{format(state.summary.tax?.fixedCotax)}</td>
              </tr>
              <tr>
                <th>地方法人税</th>
                <td>{format(state.summary.tax?.fixedLocalCotax)}</td>
              </tr>
              <tr>
                <th>法人市民税</th>
                <td>{format(state.summary.tax?.fixedMunicipalTax)}</td>
              </tr>
              <tr>
                <th>法人事業税</th>
                <td>{format(state.summary.tax?.fixedBizTax)}</td>
              </tr>
              <tr>
                <th>地方法人特別税</th>
                <td>{format(state.summary.tax?.fixedSpecialLocalCotax)}</td>
              </tr>
              <tr>
                <th>合計納税額</th>
                <td>
                  {(() => {
                    let sum = "";
                    if (state.summary.tax != null) {
                      const t = state.summary.tax;
                      const sumValue =
                        t.fixedCotax +
                        t.fixedLocalCotax +
                        t.fixedMunicipalTax +
                        t.fixedBizTax +
                        t.fixedSpecialLocalCotax;
                      sum = Numeral(sumValue).format("0,0");
                    }
                    return sum;
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const format = (n: number | undefined) => {
  if (format == null) {
    return "";
  }
  return Numeral(n).format("0,0");
};

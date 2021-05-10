import * as React from "react";
import { useActions, useState } from "@module/action";
import { Context } from "@component/Main";

export const Header = () => {
  // load initial data
  const { loadInit, setTmpLedgerCd } = useActions();
  const context = React.useContext(Context);
  const state = useState();

  const [journalChecked, setJournalChecked] = React.useState(
    context.showJournal
  );
  const [ledgerChecked, setLedgerChecked] = React.useState(
    context.ledgerCd != null
  );
  const [ledgerCd, setLedgerCd] = React.useState(context.ledgerCd);
  const journalRef = React.createRef<HTMLInputElement>();
  const ledgerRef = React.createRef<HTMLInputElement>();
  const ledgerCdSelectRef = React.createRef<HTMLSelectElement>();

  const createUrl = (props: {
    nendo: string | undefined;
    showJournal: boolean;
    showLedger: boolean;
    ledgerCd: string | undefined;
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
    return `/${url.join("/")}`;
  };

  React.useEffect(() => {
    loadInit();
  }, []);

  React.useEffect(() => {
    if (context.ledgerCd != null) {
      setTmpLedgerCd(context.ledgerCd);
    }
  }, [context.ledgerCd]);

  return (
    <div>
      <div>
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
      </div>
      <div>
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
                    })
                  );
                } else {
                  context.history.push(
                    createUrl({
                      nendo: context.nendo,
                      ledgerCd: undefined,
                      showJournal: false,
                      showLedger: true,
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
      </div>
    </div>
  );
};

import * as React from "react";
import { useActions, useState } from "@module/action";
import { Context } from "@component/Main";

export const Header = () => {
  // load initial data
  const { loadInit } = useActions();
  React.useEffect(() => {
    loadInit();
  }, []);

  const context = React.useContext(Context);
  const state = useState();

  const createUrl = (props: { nendo?: string; ledgerCd?: string }): string => {
    const url = [];
    if (props.nendo === "") {
      return "/";
    }
    if (props.nendo == null) {
      props.nendo = context.nendo;
    }
    if (props.ledgerCd == null) {
      props.ledgerCd = context.ledgerCd;
    }
    if (props.nendo != null) {
      url.push(props.nendo);
    }
    if (props.ledgerCd != null) {
      url.push(props.ledgerCd);
    }
    return `/${url.join("/")}`;
  };

  return (
    <div>
      <div>
        <label>
          年度:
          <select
            value={context.nendo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              context.history.push(createUrl({ nendo: e.target.value }));
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
          <input type="radio" name="displayType" id="journal" value="journal" />
          仕訳帳
        </label>
        <label>
          <input type="radio" name="displayType" id="ledger" value="ledger" />
          出納帳
        </label>
        <select
          value={context.ledgerCd}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            context.history.push(createUrl({ ledgerCd: e.target.value }));
          }}
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

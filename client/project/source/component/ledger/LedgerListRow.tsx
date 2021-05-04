import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { DateTime } from "luxon";
import { useActions, actions } from "@module/action";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import {
  LedgerListInputErrorItem,
  SetLedgerListInputError,
} from "@component/ledger/LedgerListError";
import { Context } from "@component/Main";

export const LedgerListRow = (props: {
  ledger: LedgerSearchResponse;
  error: Readonly<LedgerListInputErrorItem>;
  setError: SetLedgerListInputError;
  notifyError: () => void;
}) => {
  const { updateJournal } = useActions();
  const [dateStr, setDate] = React.useState(props.ledger.date);
  // prettier-ignore
  const [kariValue, setKariValue] = React.useState(`${props.ledger.karikata_value}`);
  // prettier-ignore
  const [kasiValue, setKasiValue] = React.useState(`${props.ledger.kasikata_value}`);

  const context = React.useContext(Context);
  // 更新後に必要な処理
  // 金額等を更新すると累計金額が全体的に変更されるため全データを取り直す必要がある。
  const reloadLedger = (needClear?: boolean) => {
    const ret = [];
    if (needClear) {
      // 日付を変更する場合、データの並び順が変わってしまうがその場合、
      // 再描画で行が重複してしまう(※原因要調査)ため事前にクリア処理をする。
      // ただしクリアするとフォーカスを失う模様。
      ret.push(actions.setLedger([]));
    }
    ret.push(
      actions.loadLedger({
        nendo: context.nendo,
        target_cd: context.ledgerCd,
      })
    );
    return ret;
  };

  const updateDateDebounced = useDebouncedCallback((dateStr: string) => {
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    updateJournal(
      props.ledger.journal_id,
      { date: dateStr },
      reloadLedger(true)
    );
  }, 1500);

  const updateValueDebounced = useDebouncedCallback(
    // prettier-ignore
    (targetKey: "karikata_value" | "kasikata_value", value: number) => {
      updateJournal(props.ledger.journal_id, { [targetKey]: value }, reloadLedger());
    },
    1500
  );

  const updateDate = (dateStr: string) => {
    props.setError("date", { hasError: false });
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason == null) {
      updateDateDebounced(dateStr);
    } else {
      props.setError("date", {
        hasError: true,
        message: "日付が不正です",
        inputValue: dateStr,
      });
    }
  };

  // 金額更新処理(借方・貸方共通)
  const updateValue = (
    targetKey: "karikata_value" | "kasikata_value",
    value: number
  ) => {
    updateValueDebounced(targetKey, value);
  };

  React.useEffect(() => {
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason == null) {
      setDate(date.toFormat("yyyy/mm/dd"));
    }
  }, []);

  return (
    <tr>
      <td className="ledgerBody-date">
        <input
          type="text"
          value={dateStr}
          maxLength={8}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setDate(e.target.value);
            updateDate(e.target.value);
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const dateStr = e.target.value;
            const date = DateTime.fromFormat(dateStr, "yyyy/mm/dd");
            if (date.invalidReason == null) {
              setDate(date.toFormat("yyyymmdd"));
            }
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const dateStr = e.target.value;
            const date = DateTime.fromFormat(dateStr, "yyyymmdd");
            if (date.invalidReason == null) {
              setDate(date.toFormat("yyyy/mm/dd"));
            }
            props.notifyError();
          }}
          className={`ledgerBody-date-input ${
            props.error.date != null ? "error" : ""
          }`}
        />
      </td>
      <td className="ledgerBody-anotherCd">
        <input type="text" value={props.ledger.another_cd} />
      </td>
      <td className="ledgerBody-karikataValue">
        <input
          type="text"
          value={kariValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKariValue(e.target.value);
            updateValue("karikata_value", Number(e.target.value));
          }}
          className="num value"
        />
      </td>
      <td className="ledgerBody-kasikataValue">
        <input type="text" value={kasiValue} className="num value" />
      </td>
      <td className="ledgerBody-acc">
        <input
          type="text"
          value={props.ledger.acc}
          disabled
          className="num readonly"
        />
      </td>
      <td className="ledgerBody-note">
        <input type="text" />
      </td>
    </tr>
  );
};

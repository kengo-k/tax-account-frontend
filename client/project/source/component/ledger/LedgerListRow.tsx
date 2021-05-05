import * as React from "react";
import { useSelector } from "typeless";
import { useDebouncedCallback } from "use-debounce";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, actions } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
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
  const saimokuMap = useSelector(selectSaimokuMap);

  const [dateStr, setDate] = React.useState(props.ledger.date);
  // prettier-ignore
  const [kariValueStr, setKariValue] = React.useState(`${props.ledger.karikata_value}`);
  // prettier-ignore
  const [kasiValueStr, setKasiValue] = React.useState(`${props.ledger.kasikata_value}`);

  const kariRef = React.createRef<HTMLInputElement>();
  const kasiRef = React.createRef<HTMLInputElement>();

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
    props.setError("date_required", { hasError: false });
    props.setError("date_format", { hasError: false });
    if (dateStr == null || dateStr.length === 0) {
      props.setError("date_required", {
        hasError: true,
        message: "日付が未入力です",
        targetId: ["date"],
      });
      return;
    }
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason == null) {
      updateDateDebounced(dateStr);
    } else {
      props.setError("date_format", {
        hasError: true,
        message: `日付が不正です: ${dateStr}`,
        targetId: ["date"],
      });
    }
  };

  // 借方金額更新処理
  const updateKariValue = (valueStr: string) => {
    props.setError("kari_format", { hasError: false });
    props.setError("kari_negative", { hasError: false });
    updateValues(valueStr, kasiRef.current!.value);
    if (isEmpty(valueStr)) {
      return;
    }
    const numeral = Numeral(valueStr);
    const value = numeral.value();
    if (value == null) {
      props.setError("kari_format", {
        hasError: true,
        message: `数値で入力してください: ${valueStr}`,
        targetId: ["karikata_value"],
      });
      return;
    }
    if (value <= 0) {
      props.setError("kari_negative", {
        hasError: true,
        message: `正の数値を入力してください: ${valueStr}`,
        targetId: ["karikata_value"],
      });
      return;
    }
    updateValueDebounced("karikata_value", value);
  };

  // 貸方金額更新処理
  const updateKasiValue = (valueStr: string) => {
    props.setError("kasi_format", { hasError: false });
    props.setError("kasi_negative", { hasError: false });
    updateValues(valueStr, kariRef.current!.value);
    if (isEmpty(valueStr)) {
      return;
    }
    const numeral = Numeral(valueStr);
    const value = numeral.value();
    if (value == null) {
      props.setError("kasi_format", {
        hasError: true,
        message: `数値で入力してください: ${valueStr}`,
        targetId: ["kasikata_value"],
      });
      return;
    }
    if (value <= 0) {
      props.setError("kasi_negative", {
        hasError: true,
        message: `正の数値を入力してください: ${valueStr}`,
        targetId: ["kasikata_value"],
      });
      return;
    }
    updateValueDebounced("kasikata_value", value);
  };

  // 借方・貸方関連チェック
  // どちらか片方だけが入力されていることをチェックする
  const updateValues = (kariValueStr: string, kasiValueStr: string) => {
    props.setError("value_both", { hasError: false });
    props.setError("value_neither", { hasError: false });
    if (isEmpty(kariValueStr) && isEmpty(kasiValueStr)) {
      props.setError("value_neither", {
        hasError: true,
        message: "金額が入力されていません",
        targetId: ["karikata_value", "kasikata_value"],
      });
      return false;
    }
    if (!isEmpty(kariValueStr) && !isEmpty(kasiValueStr)) {
      props.setError("value_neither", {
        hasError: true,
        message: "金額は借方・貸方どちらか一方のみ入力できます",
        targetId: ["karikata_value", "kasikata_value"],
      });
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason == null) {
      setDate(date.toFormat("yyyy/mm/dd"));
    }
    const kariValue = Numeral(kariValueStr);
    if (kariValue.value() === 0) {
      setKariValue("");
    }
    const kasiValue = Numeral(kasiValueStr);
    if (kasiValue.value() === 0) {
      setKasiValue("");
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
            props.error.date_format != null || props.error.date_required
              ? "error"
              : ""
          }`}
        />
      </td>
      <td className="ledgerBody-anotherCd">
        <input
          type="text"
          value={`${props.ledger.another_cd}:${
            saimokuMap.get(props.ledger.another_cd)?.saimoku_ryaku_name
          }`}
        />
      </td>
      <td className="ledgerBody-karikataValue">
        <input
          type="text"
          value={kariValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKariValue(e.target.value);
            updateKariValue(e.target.value);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            props.notifyError();
          }}
          className={`num value ${
            props.error.kari_format != null ||
            props.error.kari_negative != null ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? "error"
              : ""
          }`}
          ref={kariRef}
        />
      </td>
      <td className="ledgerBody-kasikataValue">
        <input
          type="text"
          value={kasiValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKasiValue(e.target.value);
            updateKasiValue(e.target.value);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            props.notifyError();
          }}
          className={`num value ${
            props.error.kasi_format != null ||
            props.error.kasi_negative ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? "error"
              : ""
          }`}
          ref={kasiRef}
        />
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

const isEmpty = (str: string) => str == null || str.length === 0;

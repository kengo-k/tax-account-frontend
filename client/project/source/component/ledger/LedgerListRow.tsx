import * as React from "react";
import { useSelector } from "typeless";
import { useDebouncedCallback } from "use-debounce";
import { DateTime } from "luxon";
import Numeral from "numeral";
import flatmap from "lodash.flatmap";
import { useActions, actions, useState } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import {
  LedgerListInputErrorItem,
  SetLedgerListInputError,
} from "@component/ledger/LedgerListError";
import { Context } from "@component/Main";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import { toNumber } from "@component/ledger/LedgerList";

export const LedgerListRow = (props: {
  ledger: LedgerSearchResponse;
  error: Readonly<LedgerListInputErrorItem>;
  setError: SetLedgerListInputError;
  notifyError: () => void;
}) => {
  const { updateJournal, updateLedger } = useActions();
  const { saimokuList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);

  const [dateStr, setDate] = React.useState(props.ledger.date);
  // prettier-ignore
  const [kariValueStr, setKariValue] = React.useState(`${props.ledger.karikata_value}`);
  // prettier-ignore
  const [kasiValueStr, setKasiValue] = React.useState(`${props.ledger.kasikata_value}`);
  const [cd, setCd] = React.useState(props.ledger.another_cd);
  const [cdName, setCdName] = React.useState(
    saimokuMap.get(props.ledger.another_cd)?.saimoku_ryaku_name
  );
  const [cdSelectMode, setCdSelectMode] = React.useState(false);
  const [cdSearchKey, setCdSearchKey] = React.useState(props.ledger.another_cd);
  const [filterdSaimokuList, setFilterdSaimokuList] = React.useState(
    [] as SaimokuMasterEntity[]
  );
  let cdCandidateUseMode = false;

  const kariRef = React.createRef<HTMLInputElement>();
  const kasiRef = React.createRef<HTMLInputElement>();
  const cdSearchRef = React.createRef<HTMLInputElement>();
  const cdCandidateRef = React.createRef<HTMLSelectElement>();

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
        ledger_cd: context.ledgerCd,
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

  const updateLedgerDebounced = useDebouncedCallback(
    (request: LedgerUpdateRequest) => {
      updateLedger(request.id, request);
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
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: context.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: value,
      kasikata_value: null,
    });
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
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: context.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: null,
      kasikata_value: value,
    });
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

  const updateCd = (other_cd: string) => {
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: context.ledgerCd,
      other_cd,
      karikata_value: toNumber(kariRef.current?.value),
      kasikata_value: toNumber(kasiRef.current?.value),
    });
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

  React.useEffect(() => {
    if (cdSearchRef.current != null) {
      cdSearchRef.current.focus();
      //cdSearchRef.current.select();
    }
  }, [cdSearchRef]);

  React.useEffect(() => {
    const filterdSaimokuList = flatmap(saimokuList, (s) => {
      if (s.saimoku_cd.toLowerCase().startsWith(cdSearchKey.toLowerCase())) {
        return [s];
      }
      if (
        s.saimoku_kana_name.toLowerCase().indexOf(cdSearchKey.toLowerCase()) >
        -1
      ) {
        return [s];
      }
      return [];
    });
    setFilterdSaimokuList(filterdSaimokuList);
  }, [cdSearchKey, saimokuList]);

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
        {cdSelectMode ? (
          <div className="cdSelect">
            <input
              type="text"
              value={cdSearchKey}
              onChange={(e: React.FocusEvent<HTMLInputElement>) => {
                setCdSearchKey(e.target.value);
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                setTimeout(() => {
                  if (!cdCandidateUseMode) {
                    setCdSelectMode(false);
                  }
                }, 1);
                const otherCd = e.target.value.toUpperCase();
                if (saimokuMap.has(otherCd)) {
                  setCd(otherCd);
                  updateCd(otherCd);
                }
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "ArrowDown") {
                  if (cdCandidateRef.current != null) {
                    cdCandidateRef.current.focus();
                    cdCandidateRef.current.value =
                      filterdSaimokuList[0].saimoku_cd;
                  }
                }
              }}
              className="search"
              ref={cdSearchRef}
            />
            <select
              size={7}
              className="candidate"
              tabIndex={-1}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                if (cdSearchRef.current != null) {
                  cdSearchRef.current.value = e.target.value;
                }
              }}
              onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
                cdCandidateUseMode = true;
              }}
              onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
                cdCandidateUseMode = false;
                setCdSelectMode(false);
                setCd(e.target.value);
                updateCd(e.target.value);
              }}
              ref={cdCandidateRef}
            >
              {filterdSaimokuList.map((s) => {
                return (
                  <option key={s.saimoku_cd} value={s.saimoku_cd}>
                    {`${s.saimoku_cd}:${s.saimoku_ryaku_name}`}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <input
            type="text"
            value={`${cd}:${saimokuMap.get(cd)?.saimoku_ryaku_name}`}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(true);
              setCdSearchKey(props.ledger.another_cd);
            }}
          />
        )}
      </td>
      <td>
        <input type="text" value={cdName} disabled readOnly />
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
      <td className="ledgerBody-note">
        <input type="text" />
      </td>
      <td className="ledgerBody-acc">
        <input
          type="text"
          value={props.ledger.acc}
          disabled
          className="num readonly"
        />
      </td>
    </tr>
  );
};

const isEmpty = (str: string) => str == null || str.length === 0;

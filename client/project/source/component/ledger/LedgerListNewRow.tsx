import * as React from "react";
import { useSelector } from "typeless";
import { DateTime } from "luxon";
import Numeral from "numeral";
import flatmap from "lodash.flatmap";
import { useActions, actions, useState } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
import {
  LedgerListInputErrorItem,
  SetLedgerListInputError,
} from "@component/ledger/LedgerListError";
import { Context } from "@component/Main";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { toNumber, toRawDate } from "@component/ledger/LedgerList";

export const LedgerListNewRow = (props: {
  error: Readonly<LedgerListInputErrorItem>;
  setError: SetLedgerListInputError;
  notifyError: () => void;
}) => {
  const { createLedger } = useActions();
  const { saimokuList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);

  const [dateStr, setDate] = React.useState("");
  // prettier-ignore
  const [kariValueStr, setKariValue] = React.useState("");
  // prettier-ignore
  const [kasiValueStr, setKasiValue] = React.useState("");
  const [cd, setCd] = React.useState("");
  const [cdSelectMode, setCdSelectMode] = React.useState(false);
  const [cdSearchKey, setCdSearchKey] = React.useState("");
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

  const updateDate = (dateStr: string) => {
    props.setError("date_required", { hasError: false });
    props.setError("date_format", { hasError: false });
    if (dateStr == null || dateStr.length === 0) {
      props.setError("date_required", {
        hasError: true,
        message: "日付が未入力です",
        targetId: ["date"],
      });
      return false;
    }
    const date1 = DateTime.fromFormat(dateStr, "yyyymmdd");
    const date2 = DateTime.fromFormat(dateStr, "yyyy/mm/dd");
    if (date1.invalidReason == null || date2.invalidReason == null) {
      return true;
    } else {
      props.setError("date_format", {
        hasError: true,
        message: `日付が不正です: ${dateStr}`,
        targetId: ["date"],
      });
      return false;
    }
  };

  // 借方金額更新処理
  const updateKariValue = (valueStr: string) => {
    props.setError("kari_format", { hasError: false });
    props.setError("kari_negative", { hasError: false });
    updateValues(valueStr, kasiRef.current!.value);
    if (isEmpty(valueStr)) {
      return true;
    }
    const numeral = Numeral(valueStr);
    const value = numeral.value();
    if (value == null) {
      props.setError("kari_format", {
        hasError: true,
        message: `数値で入力してください: ${valueStr}`,
        targetId: ["karikata_value"],
      });
      return false;
    }
    if (value <= 0) {
      props.setError("kari_negative", {
        hasError: true,
        message: `正の数値を入力してください: ${valueStr}`,
        targetId: ["karikata_value"],
      });
      return false;
    }
    return true;
  };

  // 貸方金額更新処理
  const updateKasiValue = (valueStr: string) => {
    props.setError("kasi_format", { hasError: false });
    props.setError("kasi_negative", { hasError: false });
    updateValues(valueStr, kariRef.current!.value);
    if (isEmpty(valueStr)) {
      return true;
    }
    const numeral = Numeral(valueStr);
    const value = numeral.value();
    if (value == null) {
      props.setError("kasi_format", {
        hasError: true,
        message: `数値で入力してください: ${valueStr}`,
        targetId: ["kasikata_value"],
      });
      return false;
    }
    if (value <= 0) {
      props.setError("kasi_negative", {
        hasError: true,
        message: `正の数値を入力してください: ${valueStr}`,
        targetId: ["kasikata_value"],
      });
      return false;
    }
    return true;
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

  const updateCd = (otherCd: string) => {
    props.setError("cd_invalid", { hasError: false });
    props.setError("cd_required", { hasError: false });
    if (otherCd.length === 0) {
      props.setError("cd_required", {
        hasError: true,
        message: "相手科目コードが入力されていません",
        targetId: ["another_cd"],
      });
      return false;
    }
    if (!saimokuMap.has(otherCd.toUpperCase())) {
      props.setError("cd_invalid", {
        hasError: true,
        message: `相手科目コードが正しくありません: ${otherCd}`,
        targetId: ["another_cd"],
      });
      return false;
    }
    return true;
  };

  const save = () => {
    const validateResutls = [
      updateDate(dateStr),
      updateKariValue(kariValueStr),
      updateKasiValue(kasiValueStr),
      updateCd(cdSearchKey),
    ];
    if (validateResutls.every((valid) => valid)) {
      createLedger({
        nendo: context.nendo,
        date: toRawDate(dateStr),
        ledger_cd: context.ledgerCd,
        other_cd: cdSearchKey,
        karikata_value: toNumber(kariValueStr),
        kasikata_value: toNumber(kasiValueStr),
        note: undefined,
      });
      setDate("");
      setCd("");
      setCdSearchKey("");
      setKariValue("");
      setKasiValue("");
    } else {
      props.notifyError();
    }
  };

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
            //updateDate(e.target.value);
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
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              save();
            }
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
                } else {
                  setCd("");
                  setCdSearchKey("");
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
                if (e.key === "Enter") {
                  save();
                }
              }}
              className={`search ${
                props.error.cd_required != null ||
                props.error.cd_invalid != null
                  ? "error"
                  : ""
              }`}
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
            value={`${
              cd.length === 0
                ? ""
                : `${cd}:${saimokuMap.get(cd)?.saimoku_ryaku_name}`
            }  `}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(true);
              setCdSearchKey(cd);
            }}
            className={`search ${
              props.error.cd_required != null || props.error.cd_invalid != null
                ? "error"
                : ""
            }`}
          />
        )}
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
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              save();
            }
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
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              save();
            }
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
      <td>
        <br />
      </td>
    </tr>
  );
};

const isEmpty = (str: string) => str == null || str.length === 0;

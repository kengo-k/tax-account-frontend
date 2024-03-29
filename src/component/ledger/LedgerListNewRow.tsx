import * as React from "react";
import { useSelector } from "typeless";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
import { selectNendoMap } from "@module/selector/selectNendoMap";
import {
  LedgerListInputErrorItem,
  SetLedgerListInputError,
} from "@component/ledger/LedgerListError";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import {
  toNumber,
  toRawDate,
  filterSaimokuList,
  createReloadLedger,
  getTargetYYYYMM,
} from "@component/ledger/LedgerList";

export const LedgerListNewRow = (props: {
  nendo: string;
  ledgerCd: string;
  ledgerMonth?: string;
  pageNo: number;
  pageSize: number;
  error: Readonly<LedgerListInputErrorItem>;
  setError: SetLedgerListInputError;
  notifyError: () => void;
}) => {
  const { createLedger } = useActions();
  const { saimokuList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);
  const nendoMap = useSelector(selectNendoMap);

  const [dateStr, setDate] = React.useState("");
  const [dateStrDD, setDateDD] = React.useState("");
  const [kariValueStr, setKariValue] = React.useState("");
  const [kasiValueStr, setKasiValue] = React.useState("");
  const [cd, setCd] = React.useState("");
  const [cdName, setCdName] = React.useState("");
  const [cdSelectMode, setCdSelectMode] = React.useState(false);
  const [filterdSaimokuList, setFilterdSaimokuList] = React.useState(
    [] as SaimokuMasterEntity[]
  );
  const [note, setNote] = React.useState("");

  const dateRef = React.createRef<HTMLInputElement>();
  const kariRef = React.createRef<HTMLInputElement>();
  const kasiRef = React.createRef<HTMLInputElement>();

  const reloadLedger = createReloadLedger(
    props.nendo,
    props.ledgerCd,
    props.ledgerMonth,
    props.pageNo,
    props.pageSize
  );

  const updateDate = (dateStr: string) => {
    props.setError("date_required", { hasError: false });
    props.setError("date_format", { hasError: false });
    props.setError("date_nendo_range", { hasError: false });
    props.setError("date_month_range", { hasError: false });
    if (dateStr == null || dateStr.length === 0) {
      props.setError("date_required", {
        hasError: true,
        message: "日付が未入力です",
        targetId: ["date"],
      });
      return false;
    }
    // 日付項目にフォーカスがあるかどうかで表示形式が2パターン存在するため、
    // 二通りのフォーマットでチェックしどちらか片方がOKの場合に更新する
    const date1 = DateTime.fromFormat(dateStr, "yyyymmdd");
    const date2 = DateTime.fromFormat(dateStr, "yyyy/mm/dd");
    if (!(date1.invalidReason == null || date2.invalidReason == null)) {
      props.setError("date_format", {
        hasError: true,
        message: `日付が不正です: ${dateStr}`,
        targetId: ["date"],
      });
      return false;
    }

    const rawDate = toRawDate(dateStr);
    const nendoMaster = nendoMap.get(props.nendo);
    const isDateInNendoRange = (d: string) => {
      if (nendoMaster == null) {
        return false;
      }
      if (!(d >= nendoMaster.start_date && d <= nendoMaster.end_date)) {
        return false;
      }
      return true;
    };
    if (!isDateInNendoRange(rawDate)) {
      props.setError("date_nendo_range", {
        hasError: true,
        message: `対象年度内の日付で入力してください: ${DateTime.fromFormat(
          rawDate,
          "yyyymmdd"
        ).toFormat("yyyy/mm/dd")}`,
        targetId: ["date"],
      });
      return false;
    }

    if (
      props.ledgerMonth !== "all" &&
      rawDate.substr(4, 2) !== props.ledgerMonth
    ) {
      props.setError("date_month_range", {
        hasError: true,
        message: `対象月内の日付で入力してください: ${DateTime.fromFormat(
          rawDate,
          "yyyymmdd"
        ).toFormat("yyyy/mm/dd")}`,
        targetId: ["date"],
      });
      return false;
    }

    return true;
  };

  // 借方金額更新処理
  const updateKariValue = (valueStr: string) => {
    props.setError("kari_format", { hasError: false });
    props.setError("kari_negative", { hasError: false });
    const ret = updateValues(valueStr, kasiRef.current!.value);
    if (!ret) {
      return false;
    }
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
    const ret = updateValues(valueStr, kariRef.current!.value);
    if (!ret) {
      return false;
    }
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
    props.setError("cd_required", { hasError: false });
    props.setError("cd_invalid", { hasError: false });
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
    let date;
    if (props.ledgerMonth !== "all") {
      date = `${getTargetYYYYMM(
        `${props.nendo}${props.ledgerMonth}01`
      )}/${dateStrDD}`;
    } else {
      date = dateStr;
    }
    const validateResutls = [
      updateDate(date),
      updateKariValue(kariValueStr),
      updateKasiValue(kasiValueStr),
      updateCd(cd),
    ];
    if (validateResutls.every((valid) => valid)) {
      createLedger(
        {
          nendo: props.nendo,
          date: toRawDate(date),
          ledger_cd: props.ledgerCd,
          other_cd: cd,
          karikata_value: toNumber(kariValueStr),
          kasikata_value: toNumber(kasiValueStr),
          note,
        },
        reloadLedger(false)
      );
      dateRef.current?.focus();
      setDate("");
      setDateDD("");
      setCd("");
      setCdName("");
      setKariValue("");
      setKasiValue("");
      setNote("");
    } else {
      props.notifyError();
    }
  };

  React.useEffect(() => {
    const filterdSaimokuList = filterSaimokuList(saimokuList, cd);
    setFilterdSaimokuList(filterdSaimokuList);
  }, [cd, saimokuList]);

  return (
    <tr>
      <td className="ledgerBody-date">
        {props.ledgerMonth !== "all" ? (
          <>
            <input
              type="text"
              //value={`${props.nendo}/${props.ledgerMonth}/`}
              value={getTargetYYYYMM(`${props.nendo}${props.ledgerMonth}01`)}
              maxLength={6}
              readOnly
              disabled
              className={`ledgerBody-date-yyyymm`}
            />
            <input
              type="text"
              value={dateStrDD}
              maxLength={2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDateDD(e.target.value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  save();
                }
              }}
              className={`ledgerBody-date-dd ${
                props.error.date_format != null || props.error.date_required
                  ? "error"
                  : ""
              }`}
              ref={dateRef}
            />
          </>
        ) : (
          <input
            type="text"
            value={dateStr}
            maxLength={8}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDate(e.target.value);
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
              props.error.date_format != null ||
              props.error.date_required ||
              props.error.date_month_range ||
              props.error.date_nendo_range
                ? "error"
                : ""
            }`}
            ref={dateRef}
          />
        )}
      </td>
      <td className="ledgerBody-anotherCd">
        <div className="cdSelect">
          <input
            type="text"
            value={cd}
            onChange={(e: React.FocusEvent<HTMLInputElement>) => {
              setCd(e.target.value);
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(true);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(false);
              const otherCd = e.target.value.toUpperCase();
              if (saimokuMap.has(otherCd)) {
                setCd(otherCd);
                setCdName(saimokuMap.get(otherCd)!.saimoku_ryaku_name);
              } else if (filterdSaimokuList.length === 1) {
                setCd(filterdSaimokuList[0].saimoku_cd);
                setCdName(filterdSaimokuList[0].saimoku_ryaku_name);
              } else {
                setCd("");
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                save();
              }
            }}
            className={`search ${
              props.error.cd_required != null || props.error.cd_invalid != null
                ? "error"
                : ""
            }`}
          />
          {cdSelectMode ? (
            <select size={5} className="candidate" tabIndex={-1}>
              {filterdSaimokuList.map((s) => {
                return (
                  <option key={s.saimoku_cd} value={s.saimoku_cd}>
                    {`${s.saimoku_cd}:${s.saimoku_ryaku_name}`}
                  </option>
                );
              })}
            </select>
          ) : (
            <></>
          )}
        </div>
      </td>
      <td className="ledgerBody-otherCdName">
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
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value;
            if (valueStr.length === 0) {
              return;
            }
            const value = Numeral(valueStr);
            const rawValue = `${value.value()}`;
            setKariValue(rawValue);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value;
            const value = Numeral(valueStr);
            const fmtValue = value.value() == null ? "" : value.format("0,0");
            setKariValue(fmtValue);
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
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value;
            if (valueStr.length === 0) {
              return;
            }
            const value = Numeral(valueStr);
            const rawValue = `${value.value()}`;
            setKasiValue(rawValue);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value;
            const value = Numeral(valueStr);
            const fmtValue = value.value() == null ? "" : value.format("0,0");
            setKasiValue(fmtValue);
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
        <input
          type="text"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              save();
            }
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            save();
          }}
        />
      </td>
      <td>
        <br />
      </td>
    </tr>
  );
};

const isEmpty = (str: string) => str == null || str.length === 0;

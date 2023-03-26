import * as React from "react";
import { useSelector } from "typeless";
import { useDebouncedCallback } from "use-debounce";
import { DateTime } from "luxon";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";
import { selectSaimokuMap } from "@module/selector/selectSaimokuMap";
import { selectNendoMap } from "@module/selector/selectNendoMap";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import {
  LedgerListInputErrorItem,
  SetLedgerListInputError,
  hasError,
} from "@component/ledger/LedgerListError";
import { SaimokuMasterEntity } from "@common/model/master/SaimokuMasterEntity";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import {
  toNumber,
  filterSaimokuList,
  createReloadLedger,
  getTargetYYYYMM,
} from "@component/ledger/LedgerList";

export const LedgerListRow = (props: {
  nendo: string;
  ledgerCd: string;
  ledgerMonth?: string;
  pageNo: number;
  pageSize: number;
  ledger: LedgerSearchResponse;
  error: Readonly<LedgerListInputErrorItem>;
  setError: SetLedgerListInputError;
  notifyError: () => void;
}) => {
  const { updateJournal, deleteJournal, updateLedger } = useActions();
  const { saimokuList } = useState();
  const saimokuMap = useSelector(selectSaimokuMap);
  const nendoMap = useSelector(selectNendoMap);

  const [dateStr, setDate] = React.useState(props.ledger.date);
  const [dateStrDD, setDateDD] = React.useState(props.ledger.date.substr(6, 2));
  // prettier-ignore
  const [kariValueStr, setKariValue] = React.useState(`${props.ledger.karikata_value}`);
  // prettier-ignore
  const [kasiValueStr, setKasiValue] = React.useState(`${props.ledger.kasikata_value}`);
  const [cd, setCd] = React.useState(props.ledger.another_cd);
  const [cdName, setCdName] = React.useState("");
  const [cdSelectMode, setCdSelectMode] = React.useState(false);
  const [filterdSaimokuList, setFilterdSaimokuList] = React.useState(
    [] as SaimokuMasterEntity[]
  );
  const [note, setNote] = React.useState(props.ledger.note);

  const kariRef = React.createRef<HTMLInputElement>();
  const kasiRef = React.createRef<HTMLInputElement>();

  const reloadLedger = createReloadLedger(
    props.nendo,
    props.ledgerCd,
    props.ledgerMonth,
    props.pageNo,
    props.pageSize
  );

  const updateDateDebounced = useDebouncedCallback((dateStr: string) => {
    updateJournal(
      props.ledger.journal_id,
      { date: dateStr },
      reloadLedger(true)
    );
  }, 1500);

  const updateNoteDebounced = useDebouncedCallback((note: string) => {
    updateJournal(props.ledger.journal_id, { note });
  }, 1500);

  const updateLedgerDebounced = useDebouncedCallback(
    (request: LedgerUpdateRequest) => {
      updateLedger(request.id, request, reloadLedger(false));
    },
    1500
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
      return;
    }
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason != null) {
      props.setError("date_format", {
        hasError: true,
        message: `日付が不正です: ${dateStr}`,
        targetId: ["date"],
      });
      return;
    }

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
    if (!isDateInNendoRange(dateStr)) {
      props.setError("date_nendo_range", {
        hasError: true,
        message: `対象年度内の日付で入力してください: ${DateTime.fromFormat(
          dateStr,
          "yyyymmdd"
        ).toFormat("yyyy/mm/dd")}`,
        targetId: ["date"],
      });
      return;
    }

    if (
      props.ledgerMonth !== "all" &&
      dateStr.substr(4, 2) !== props.ledgerMonth
    ) {
      props.setError("date_month_range", {
        hasError: true,
        message: `対象月内の日付で入力してください: ${DateTime.fromFormat(
          dateStr,
          "yyyymmdd"
        ).toFormat("yyyy/mm/dd")}`,
        targetId: ["date"],
      });
      return;
    }
    updateDateDebounced(dateStr);
  };

  // 借方金額更新処理
  const updateKariValue = (valueStr: string) => {
    props.setError("kari_format", { hasError: false });
    props.setError("kari_negative", { hasError: false });
    const ret = updateValues(valueStr, kasiRef.current!.value);
    if (!ret) {
      return;
    }
    if (!isEmpty(valueStr)) {
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
    }
    if (hasError(props.error, "kasi_format", "kasi_negative")) {
      return;
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: toNumber(valueStr),
      kasikata_value: toNumber(kasiRef.current?.value),
    });
  };

  // 貸方金額更新処理
  const updateKasiValue = (valueStr: string) => {
    props.setError("kasi_format", { hasError: false });
    props.setError("kasi_negative", { hasError: false });
    const ret = updateValues(valueStr, kariRef.current!.value);
    if (!ret) {
      return;
    }
    if (!isEmpty(valueStr)) {
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
    }
    if (hasError(props.error, "kari_format", "kari_negative")) {
      return;
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: toNumber(kariRef.current?.value),
      kasikata_value: toNumber(valueStr),
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

  const updateCd = (otherCd: string) => {
    props.setError("cd_required", { hasError: false });
    props.setError("cd_invalid", { hasError: false });
    if (otherCd.length === 0) {
      props.setError("cd_required", {
        hasError: true,
        message: "相手科目コードが入力されていません",
        targetId: ["another_cd"],
      });
      return;
    }
    if (
      !saimokuMap.has(otherCd.toUpperCase()) &&
      filterdSaimokuList.length !== 1
    ) {
      props.setError("cd_invalid", {
        hasError: true,
        message: `相手科目コードが正しくありません: ${otherCd}`,
        targetId: ["another_cd"],
      });
      return;
    }
    let paramCd = otherCd;
    if (saimokuMap.has(otherCd)) {
      setCd(otherCd);
      setCdName(saimokuMap.get(otherCd)!.saimoku_ryaku_name);
    } else if (filterdSaimokuList.length === 1) {
      setCd(filterdSaimokuList[0].saimoku_cd);
      setCdName(filterdSaimokuList[0].saimoku_ryaku_name);
      paramCd = filterdSaimokuList[0].saimoku_cd;
    } else {
      setCd("");
      return;
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: paramCd,
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
    } else {
      setKariValue(kariValue.format("0,0"));
    }
    const kasiValue = Numeral(kasiValueStr);
    if (kasiValue.value() === 0) {
      setKasiValue("");
    } else {
      setKasiValue(kasiValue.format("0,0"));
    }
  }, []);

  React.useEffect(() => {
    const saimoku = saimokuMap.get(props.ledger.another_cd);
    if (saimoku != null) {
      setCdName(saimoku.saimoku_ryaku_name);
    }
  }, [saimokuMap]);

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
              value={getTargetYYYYMM(props.ledger.date)}
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
                updateDate(
                  `${props.nendo}${props.ledgerMonth}${e.target.value}`
                );
              }}
              onBlur={() => {
                props.notifyError();
              }}
              className={`ledgerBody-date-dd ${
                props.error.date_format != null || props.error.date_required
                  ? "error"
                  : ""
              }`}
            />
          </>
        ) : (
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
              props.error.date_format != null ||
              props.error.date_required ||
              props.error.date_month_range ||
              props.error.date_nendo_range
                ? "error"
                : ""
            }`}
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
            onFocus={() => {
              setCdSelectMode(true);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(false);
              updateCd(e.target.value);
              props.notifyError();
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
        <input
          type="text"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value);
            updateNoteDebounced(e.target.value);
          }}
        />
      </td>
      <td className="ledgerBody-acc">
        <input
          type="text"
          value={Numeral(props.ledger.acc).format("0,0")}
          disabled
          className="num readonly"
        />
      </td>
      <td>
        <button
          onClick={() => {
            deleteJournal(props.ledger.journal_id, reloadLedger(false));
          }}
        >
          削除
        </button>
      </td>
    </tr>
  );
};

const isEmpty = (str: string) => str == null || str.length === 0;

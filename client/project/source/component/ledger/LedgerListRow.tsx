import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { DateTime } from "luxon";
import { useActions } from "@module/action";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";

export const LedgerListRow = (props: { ledger: LedgerSearchResponse }) => {
  const { updateJournal } = useActions();
  const [dateStr, setDate] = React.useState(props.ledger.date);
  const dateRef = React.useRef<HTMLInputElement>(null);

  const updateDate = useDebouncedCallback((dateStr: string) => {
    const date = DateTime.fromFormat(dateStr, "yyyymmdd");
    if (date.invalidReason == null) {
      console.log("UPDATE: ", dateStr);
      updateJournal(props.ledger.journal_id, { date: dateStr });
    }
  }, 1500);

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
          ref={dateRef}
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
          }}
          className="ledgerBody-date-input"
        />
      </td>
      <td className="ledgerBody-anotherCd">
        <input type="text" value={props.ledger.another_cd} />
      </td>
      <td className="ledgerBody-karikataValue">
        <input
          type="text"
          value={showValue(props.ledger.karikata_value)}
          className="num value"
        />
      </td>
      <td className="ledgerBody-kasikataValue">
        <input
          type="text"
          value={showValue(props.ledger.kasikata_value)}
          className="num value"
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

const showValue = (value: number): string => {
  return value === 0 ? "" : `${value}`;
};

const showDate = (dateStr: string): string => {
  const date = DateTime.fromFormat(dateStr, "yyyymmdd");
  if (date.invalidReason == null) {
    return date.toFormat("yyyy/mm/dd");
  }
  return dateStr;
};

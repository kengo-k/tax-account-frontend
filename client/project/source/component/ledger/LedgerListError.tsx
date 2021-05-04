import * as React from "react";

export interface Error {
  hasError: true;
  message: string;
  inputValue: string;
}

export interface Valid {
  hasError: false;
}

// 入力行単位のエラー情報
export interface LedgerListInputErrorItem {
  date?: Omit<Error, "hasError">;
}

// key: journal_id: 行を特定する情報
// value: [項目ID, エラーメッセージ]
export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>;

export type SetLedgerListInputError = (
  key: keyof LedgerListInputErrorItem,
  errorInfo: Error | Valid
) => void;

type LedgerListErrorSummary = Map<
  keyof LedgerListInputErrorItem,
  { message: string; details: { journalId: string; inputValue: string }[] }
>;

export const LedgerListError = (props: { errors: LedgerListInputErrors }) => {
  const errorSummary: LedgerListErrorSummary = new Map();
  for (const journalId of Array.from(props.errors.keys())) {
    const errorInfo = props.errors.get(journalId);
    if (errorInfo == null) {
      continue;
    }
    if (errorInfo.date != null) {
      let dateSummary = errorSummary.get("date");
      if (dateSummary == null) {
        dateSummary = { message: errorInfo.date.message, details: [] };
        errorSummary.set("date", dateSummary);
      }
      dateSummary.details.push({
        journalId,
        inputValue: errorInfo.date.inputValue,
      });
    }
  }
  return (
    <div className="ledgerListError">
      {errorSummary.get("date") != null ? (
        <ul>{createErrorMessage("date", errorSummary)}</ul>
      ) : (
        <></>
      )}
    </div>
  );
};

const createErrorMessage = (
  key: keyof LedgerListInputErrorItem,
  errorSummary: LedgerListErrorSummary
) => {
  const errors = errorSummary.get(key);
  if (errors == null) {
    return <></>;
  }
  return (
    <li>
      <span>{errors.message}</span>
      {errors.details.map((d) => {
        return (
          <>
            <span className="ledgerListErrorItem">{d.inputValue}</span>
          </>
        );
      })}
    </li>
  );
};

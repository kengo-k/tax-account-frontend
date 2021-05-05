import * as React from "react";
import flatmap from "lodash.flatmap";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";

interface Valid {
  hasError: false;
}

interface Invalid {
  hasError: true;
  message: string;
  targetId: Array<
    keyof Pick<
      LedgerSearchResponse,
      "date" | "karikata_value" | "kasikata_value" | "another_cd"
    >
  >;
}

// 入力行単位のエラー情報
export interface LedgerListInputErrorItem {
  date_required?: Omit<Invalid, "hasError">;
  date_format?: Omit<Invalid, "hasError">;
  cd_required?: Omit<Invalid, "hasError">;
  cd_invalid?: Omit<Invalid, "hasError">;
  kari_format?: Omit<Invalid, "hasError">;
  kari_negative?: Omit<Invalid, "hasError">;
  kasi_format?: Omit<Invalid, "hasError">;
  kasi_negative?: Omit<Invalid, "hasError">;
  value_both?: Omit<Invalid, "hasError">;
  value_neither?: Omit<Invalid, "hasError">;
}

// key: journal_id: 行を特定する情報
// value: [項目ID, エラーメッセージ]
export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>;

export type SetLedgerListInputError = (
  key: keyof LedgerListInputErrorItem,
  errorInfo: Valid | Invalid
) => void;

export const LedgerListError = (props: { errors: LedgerListInputErrors }) => {
  if (props.errors.size === 0) {
    return <></>;
  }

  return (
    <div className="ledgerListError">
      <ul>
        {flatmap(Array.from(props.errors.keys()), (journalId) => {
          const errorItem = props.errors.get(journalId);
          if (errorItem == null) {
            return [];
          }
          const ret: any[] = [];
          const keys = Object.keys(errorItem);
          for (const key of keys) {
            if ((errorItem as any)[key] != null) {
              ret.push(<li>{(errorItem as any)[key].message}</li>);
            }
          }
          return ret;
        })}
      </ul>
    </div>
  );
};

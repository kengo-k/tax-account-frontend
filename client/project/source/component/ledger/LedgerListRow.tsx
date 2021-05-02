import * as React from "react";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";

export const LedgerListRow = (props: { ledger: LedgerSearchResponse }) => {
  return (
    <tr>
      <td>
        <input type="text" value={props.ledger.date} />
      </td>
      <td>
        <input type="text" value={props.ledger.another_cd} />
      </td>
      <td>
        <input type="text" value={props.ledger.karikata_value} />
      </td>
      <td>
        <input type="text" value={props.ledger.kasikata_value} />
      </td>
      <td>
        <input type="text" value={props.ledger.acc} />
      </td>
      <td>
        <input type="text" />
      </td>
    </tr>
  );
};

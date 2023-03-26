import * as React from "react";
import { useModule } from "src/module/action";
import { Main } from "src/component/Main";

export const Application = () => {
  useModule();
  return <Main />;
};

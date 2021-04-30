import * as React from "react";
import { useModule } from "@module/action";
import { Main } from "@component/Main";

export const Application = () => {
  useModule();
  return <Main />;
};

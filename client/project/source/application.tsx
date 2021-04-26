import * as React from "react";
import { useModule } from "@module/action";
import { getConfig } from "@config/Config";
import { Main } from "@component/Main";

console.log(getConfig());

export const Application = () => {
  useModule();
  return <Main />;
};

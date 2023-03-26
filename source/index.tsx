import * as React from "react";
import * as ReactDOM from "react-dom";
import { DefaultTypelessProvider, Hmr, startHmr } from "typeless";

const MOUNT_NODE = document.getElementById("approot");
const render = () => {
  const Application = require("./application").Application;
  if (MOUNT_NODE != null) {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    ReactDOM.render(
      <Hmr>
        <DefaultTypelessProvider>
          <Application />
        </DefaultTypelessProvider>
      </Hmr>,
      MOUNT_NODE
    );
  }
};

if (module.hot) {
  module.hot.accept("./application", () => {
    startHmr();
    render();
  });
}
render();

import {App} from "./App.js";
import React from "../../_snowpack/pkg/react.js";
import {render} from "../../_snowpack/pkg/react-dom.js";
const appMount = document.querySelector("#app");
if (appMount)
  render(/* @__PURE__ */ React.createElement(App, null), appMount);

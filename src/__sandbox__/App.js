import React from "../../_snowpack/pkg/react.js";
import {style} from "../../_snowpack/pkg/typestyle.js";
import {Navbar, Hero, Carousel, Description, Content, Clients, Footer} from "./components/index.js";
style({
  $nest: {
    "html, body": {
      margin: "0",
      padding: "0",
      backgroundColor: "white",
      height: "2000px",
      scrollBehavior: "smooth"
    }
  }
});
export const App = () => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Navbar, null), /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Carousel, null), /* @__PURE__ */ React.createElement(Description, null), /* @__PURE__ */ React.createElement(Content, null), /* @__PURE__ */ React.createElement(Clients, null), /* @__PURE__ */ React.createElement(Footer, null));
};

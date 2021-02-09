import React from "../../../_snowpack/pkg/react.js";
import {style, media} from "../../../_snowpack/pkg/typestyle.js";
import NpmSvg from "../assets/svg/NpmSvg.js";
import GithubSvg from "../assets/svg/GithubSvg.js";
const Container = style({
  position: "fixed",
  zIndex: "999",
  width: "100%",
  height: "70px",
  backgroundColor: "#20232A"
});
const Navigation = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1100px",
  margin: "auto",
  height: "100%"
}, media({maxWidth: 1150}, {margin: "0 5%"}));
const Logo = style({
  fontFamily: "Raleway, sans-serif",
  fontWeight: "bold",
  fontSize: "25px",
  color: "#FFF",
  transition: "0.3s",
  $nest: {
    "&:hover": {
      color: "#61DAFB"
    }
  }
});
const ToTop = style({
  textDecoration: "none"
});
const Links = style({
  height: "100%",
  display: "flex",
  alignItems: "center"
});
export const Navbar = () => {
  return /* @__PURE__ */ React.createElement("div", {
    className: Container
  }, /* @__PURE__ */ React.createElement("div", {
    className: Navigation
  }, /* @__PURE__ */ React.createElement("a", {
    className: ToTop,
    href: "#"
  }, /* @__PURE__ */ React.createElement("h1", {
    className: Logo
  }, "REROUSEL")), /* @__PURE__ */ React.createElement("div", {
    className: Links
  }, /* @__PURE__ */ React.createElement("a", {
    href: "https://www.npmjs.com/package/rerousel"
  }, /* @__PURE__ */ React.createElement(NpmSvg, null)), /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/aexol-studio/rerousel"
  }, /* @__PURE__ */ React.createElement(GithubSvg, null)))));
};

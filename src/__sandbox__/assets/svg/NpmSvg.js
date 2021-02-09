import React from "../../../../_snowpack/pkg/react.js";
import {style} from "../../../../_snowpack/pkg/typestyle.js";
const IconNPM = style({
  width: "20px",
  margin: "10px",
  fill: "#FFF",
  transition: "0.2s",
  $nest: {
    "&:hover": {
      fill: "#61DAFB"
    }
  }
});
const NpmSvg = () => {
  return /* @__PURE__ */ React.createElement("svg", {
    style: {marginTop: "15px", width: "40px"},
    className: IconNPM,
    viewBox: "0 0 233 91",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ React.createElement("g", {
    "clip-path": "url(#clip0)"
  }, /* @__PURE__ */ React.createElement("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M104.064 64.8712V77.9807H78.0259V13.1094H129.743V64.8712H104.064ZM116.678 26.1287H104.065V51.8069H116.678V26.1287Z"
  }), /* @__PURE__ */ React.createElement("path", {
    d: "M38.7427 64.8712V26.1287H51.8071V64.8712H64.8714V13.1094H13.1592V64.8712H38.7427Z"
  }), /* @__PURE__ */ React.createElement("path", {
    d: "M168.485 64.8712V26.1287H181.55V64.8712H194.614V26.1287H207.678V64.8712H220.743V13.1094H142.809V64.8712H168.485Z"
  })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", {
    id: "clip0"
  }, /* @__PURE__ */ React.createElement("rect", {
    width: "233",
    height: "91"
  }))));
};
export default NpmSvg;

import React from "../../../_snowpack/pkg/react.js";
import {media, style} from "../../../_snowpack/pkg/typestyle.js";
import {descriptionData} from "../assets/data.js";
const Container = style({
  display: "flex",
  flexFlow: "row wrap",
  justifyContent: "space-between",
  margin: "40px auto",
  maxWidth: "1100px"
}, media({maxWidth: 1150}, {margin: "40px auto"}));
const Column = style({
  maxWidth: "300px",
  fontFamily: "Signika",
  fontStyle: "normal"
}, media({maxWidth: 1150}, {margin: "auto", padding: "0 3%"}), media({maxWidth: 500}, {padding: "5%"}));
const Header = style({
  fontWeight: "normal",
  fontSize: "25px",
  lineHeight: "31px",
  color: "#797979"
});
const Paragraph = style({
  fontWeight: "lighter",
  fontSize: "1.1em",
  lineHeight: "170%",
  textAlign: "justify"
});
export const Description = () => {
  return /* @__PURE__ */ React.createElement("div", {
    className: Container
  }, descriptionData.map((desc, idx) => {
    return /* @__PURE__ */ React.createElement("div", {
      className: Column,
      key: idx
    }, /* @__PURE__ */ React.createElement("h1", {
      className: Header
    }, desc.header), /* @__PURE__ */ React.createElement("p", {
      className: Paragraph
    }, desc.description));
  }));
};

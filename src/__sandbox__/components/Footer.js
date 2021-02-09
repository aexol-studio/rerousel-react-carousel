import React from "../../../_snowpack/pkg/react.js";
import styled from "../../../_snowpack/pkg/styled-components.js";
const Container = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    background-color: #20232a;
    padding: 20px;
`;
const Copyright = styled.a`
    color: white;
    font-family: Signika, sans-serif;
    font-weight: normal;
    text-align: center;
`;
export const Footer = () => {
  return /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(Copyright, {
    href: "https://aexol.com/"
  }, "Aexol - Innovative Software Development studio \xA9 2020"));
};

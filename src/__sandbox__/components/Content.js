import React, {useRef} from "../../../_snowpack/pkg/react.js";
import {style} from "../../../_snowpack/pkg/typestyle.js";
import styled from "../../../_snowpack/pkg/styled-components.js";
import {Rerousel} from "../../index.js";
import oceanic from "../../../_snowpack/pkg/prism-react-renderer/themes/oceanicNext.js";
import {LiveProvider, LiveEditor, LivePreview} from "../../../_snowpack/pkg/react-live.js";
const EditorContainer = style({
  width: "1100px",
  height: "500px",
  margin: "auto",
  borderRadius: "10px"
});
const EditorHeader = style({
  height: "50px",
  backgroundColor: "#20232A",
  borderRadius: "10px 10px 0 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  fontFamily: "Raleway, sans-serif",
  fontWeight: "bold"
});
const Editor = style({
  height: "calc(100% - 50px)",
  width: "100%",
  fontSize: "14px",
  borderRadius: "0 0 10px 10px"
});
const PreviewContainer = style({
  backgroundColor: "white",
  width: "1100px",
  margin: "50px auto",
  borderRadius: "10px"
});
const PreviewHeader = style({
  height: "50px",
  backgroundColor: "gray",
  borderRadius: "10px 10px 0 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  fontFamily: "Raleway, sans-serif",
  fontWeight: "bold"
});
const scope = {Rerousel, useRef, styled};
const code = `function App() {
  const ref = useRef(null);

  const Item = styled.div\`
    width: 550px;
    height: 50px;
    font-size: 1.5em;
    text-align: center;
    background-color: green;
  \`;

  return (
    <div>
      <header>
        
        <Rerousel itemRef={ref}>
          <Item ref={ref}>1</Item>
          <Item>2</Item>
          <Item>3</Item>
          <Item>4</Item>
          <Item>5</Item>
        </Rerousel>
        
      </header>
    </div>
  );
}`;
export const Content = () => {
  return /* @__PURE__ */ React.createElement(LiveProvider, {
    scope,
    theme: oceanic,
    code
  }, /* @__PURE__ */ React.createElement("div", {
    className: EditorContainer
  }, /* @__PURE__ */ React.createElement("header", {
    className: EditorHeader
  }, "REROUSEL SANDBOX"), /* @__PURE__ */ React.createElement(LiveEditor, {
    className: Editor
  })), /* @__PURE__ */ React.createElement("div", {
    className: PreviewContainer
  }, /* @__PURE__ */ React.createElement("header", {
    className: PreviewHeader
  }, "REROUSEL PREVIEW"), /* @__PURE__ */ React.createElement(LivePreview, null)));
};

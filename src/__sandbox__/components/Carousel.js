import React, {useRef} from "../../../_snowpack/pkg/react.js";
import {Rerousel} from "../../index.js";
import {wordCarouselItems} from "../assets/data.js";
import {style, media} from "../../../_snowpack/pkg/typestyle.js";
import styled from "../../../_snowpack/pkg/styled-components.js";
export const Carousel = () => {
  const wordsCarouselRef = useRef(null);
  const WordsCarousel = style({
    backgroundColor: "#20232A",
    color: "#FFF"
  });
  const CarouselItem = style({
    display: "flex",
    justifyContent: "center",
    width: "calc(100% / 4)",
    fontSize: "13px",
    fontFamily: "Raleway, sans-serif"
  }, media({maxWidth: 1400}, {width: "calc(100% / 3)"}), media({maxWidth: 1e3}, {width: "calc(100% / 2)"}), media({maxWidth: 700}, {width: "100%"}));
  const Item = styled.div`
        display: flex;
        justify-content: center;
        width: calc(100% / 3);
        font-size: 13px;
        font-family: Raleway, sans-serif;
    `;
  return /* @__PURE__ */ React.createElement("div", {
    className: WordsCarousel
  }, /* @__PURE__ */ React.createElement(Rerousel, {
    itemRef: wordsCarouselRef,
    interval: 2e3
  }, wordCarouselItems.map((item, idx) => {
    return /* @__PURE__ */ React.createElement(Item, {
      ref: wordsCarouselRef,
      key: idx
    }, /* @__PURE__ */ React.createElement("div", {
      className: "item_gif"
    }, /* @__PURE__ */ React.createElement("h1", {
      className: "item__header"
    }, item)));
  })));
};

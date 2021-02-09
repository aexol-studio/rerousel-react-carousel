import React, {useEffect, useCallback, useState, useRef, Children} from "../_snowpack/pkg/react.js";
import {style} from "../_snowpack/pkg/typestyle.js";
const wrapper = style({
  display: "flex",
  alignItems: "center",
  overflowX: "scroll",
  scrollSnapType: "x mandatory",
  "-webkit-overflow-scrolling": "touch",
  flexFlow: "row nowrap",
  "-ms-overflow-style": "none",
  scrollbarWidth: "none",
  $nest: {
    "& > *": {
      boxSizing: "border-box",
      flexShrink: 0
    },
    "&::-webkit-scrollbar": {
      display: "none"
    }
  }
});
export const Rerousel = ({children, itemRef, interval = 3e3}) => {
  const [itemWidth] = useWidth(itemRef);
  const [, setScrollInterval] = useState();
  const [currentScrollLeft, setCurrentScrollLeft] = useState(0);
  const wrapperRef = useRef(null);
  const cc = Children.count(children);
  function useWidth(elementRef) {
    const [width, setWidth] = useState(0);
    const updateWidth = useCallback(() => {
      if (elementRef && elementRef.current) {
        const {width: width2} = elementRef.current.getBoundingClientRect();
        setWidth(width2);
      }
    }, [elementRef]);
    useEffect(() => {
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }, [updateWidth]);
    return [width];
  }
  useEffect(() => {
    if (currentScrollLeft === 0) {
      wrapperRef.current?.scrollTo({left: 0});
      setCurrentScrollLeft(1);
      return;
    }
    if (currentScrollLeft > cc) {
      setCurrentScrollLeft(0);
      return;
    }
    if (itemWidth != void 0) {
      wrapperRef.current?.scrollTo({
        left: itemWidth * currentScrollLeft,
        behavior: "smooth"
      });
    }
  }, [currentScrollLeft, itemWidth]);
  useEffect(() => {
    const i = setInterval(() => {
      setCurrentScrollLeft((csl) => csl + 1);
    }, interval);
    setScrollInterval(i);
    return () => {
      setScrollInterval((i2) => {
        if (i2) {
          clearInterval(i2);
        }
        return void 0;
      });
    };
  }, [itemWidth]);
  return /* @__PURE__ */ React.createElement("div", {
    className: wrapper,
    ref: wrapperRef
  }, children, children);
};

import React, {useRef} from "../../../_snowpack/pkg/react.js";
import {Rerousel} from "../../index.js";
import styled from "../../../_snowpack/pkg/styled-components.js";
import {clientCarouselItems as clients} from "../assets/data.js";
const Background = styled.div`
    max-width: 1150px;
    margin: auto;
    margin-top: 120px;
`;
const Header = styled.h1`
    text-align: center;
    font-family: Raleway, sans-serif;
`;
const WrapperItem = styled.div`
    padding: 0 0 50px 0;
    width: calc(100% / 3);

    @media (max-width: 1400px) {
        width: calc(100% / 2);
    }

    @media (max-width: 1000px) {
        width: 100%;
    }
`;
const Item = styled.div`
    background-color: #282c34;
    display: flex;
    border-radius: 10px;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    padding: 50px;
    margin: 30px;
`;
const PersonInfo = styled.div`
    text-align: center;
    font-family: Raleway, sans-serif;
    color: white;
`;
const Img = styled.div`
    width: 88px;
    height: 88px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: ${({image}) => `url(${image})`};
    margin: 0 auto;
`;
const Name = styled.h3`
    font-weight: bold;
    font-size: 30px;
    line-height: 50px;
    border-bottom: white solid 2px;
    margin: 20px 0 10px 0;
`;
const Role = styled.h3`
    font-weight: 500;
    font-size: 25px;
    margin: 10px 0 20px 0;
`;
const Paragraph = styled.p`
    text-align: justify;
    color: white;
    font-family: Raleway, sans-serif;
    font-style: italic;
    line-height: 22px;
`;
export const Clients = () => {
  const outermostItemRef = useRef(null);
  return /* @__PURE__ */ React.createElement(Background, null, /* @__PURE__ */ React.createElement(Header, null, "Testimonials carousel"), /* @__PURE__ */ React.createElement(Rerousel, {
    itemRef: outermostItemRef,
    interval: 4e3
  }, clients.map((c) => {
    return /* @__PURE__ */ React.createElement(WrapperItem, {
      ref: outermostItemRef,
      key: c.name
    }, /* @__PURE__ */ React.createElement(Item, null, /* @__PURE__ */ React.createElement(PersonInfo, null, /* @__PURE__ */ React.createElement(Img, {
      image: c.image
    }), /* @__PURE__ */ React.createElement(Name, null, c.name), /* @__PURE__ */ React.createElement(Role, null, c.job)), /* @__PURE__ */ React.createElement(Paragraph, null, c.content)));
  })));
};

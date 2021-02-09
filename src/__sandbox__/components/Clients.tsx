import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import styled from 'styled-components';

import { clientCarouselItems as clients } from '../assets/data';

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

const Img = styled.div<{ image: string }>`
    width: 88px;
    height: 88px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: ${({ image }) => `url(${image})`};
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

    return (
        <Background>
            <Header>Testimonials carousel</Header>
            <Rerousel itemRef={outermostItemRef} interval={4000}>
                {clients.map((c) => {
                    console.log(c.image);
                    return (
                        <WrapperItem ref={outermostItemRef} key={c.name}>
                            <Item>
                                <PersonInfo>
                                    <Img image={c.image} />
                                    <Name>{c.name}</Name>
                                    <Role>{c.job}</Role>
                                </PersonInfo>
                                <Paragraph>{c.content}</Paragraph>
                            </Item>
                        </WrapperItem>
                    );
                })}
            </Rerousel>
        </Background>
    );
};

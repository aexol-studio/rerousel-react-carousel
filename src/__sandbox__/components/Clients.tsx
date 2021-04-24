import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Rerousel } from '@/index';
import { media, style } from 'typestyle';
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

const Button = style(
    {
        height: '60px',
        width: '200px',
        backgroundColor: 'transparent',
        border: '4px solid #61DAFB',
        borderRadius: '10px',
        fontFamily: 'Signika, sans-serif',
        color: '#000',
        fontSize: '18px',
        fontWeight: 'lighter',
        transition: '0.5s',
        marginTop: '20px',
        cursor: 'pointer',
        marginBottom: '30px',
        $nest: {
            '&:hover': {
                backgroundColor: '#61DAFB',
            },
        },
    },
    media({ maxWidth: 800 }, { marginTop: '10px', height: '50px', width: '200px', fontSize: '15px' }),
);

const ButtonTwo = style(
    {
        height: '60px',
        width: '100px',
        backgroundColor: 'transparent',
        border: '4px solid black',
        borderRadius: '10px',
        fontFamily: 'Signika, sans-serif',
        color: '#000',
        fontSize: '18px',
        fontWeight: 'lighter',
        transition: '0.5s',
        marginTop: '20px',
        cursor: 'pointer',
        marginBottom: '30px',
        $nest: {
            '&:hover': {
                backgroundColor: 'black',
                color: 'white',
            },
        },
    },
    media({ maxWidth: 800 }, { marginTop: '10px', height: '50px', width: '200px', fontSize: '15px' }),
);

const Input = styled.input`
    margin-top: 20px;
    padding: 10px 50px;
    width: 350px;
    border: 2px solid black;
    box-sizing: border-box;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    font-family: Raleway, sans-serif;
    font-variant-numeric: lining-nums;
    letter-spacing: 2px;

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    &[type='number'] {
        -moz-appearance: textfield;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    width: 350px;
    justify-content: space-between;
`;

const ControllerHolder = styled.div`
    font-family: Raleway, sans-serif;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

export const Clients = () => {
    const [inputValue, setInputValue] = useState<number>();
    const [carouselInterval, setCarouselInterval] = useState<number>(3000);
    const [carouselStop, setCarouselStop] = useState<boolean>(false);
    const outermostItemRef = useRef(null);

    return (
        <Background>
            <Header>Testimonials carousel</Header>
            <Rerousel itemRef={outermostItemRef} interval={carouselInterval} stop={carouselStop}>
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
            <ControllerHolder>
                Set custom interval:
                <Input type="number" onChange={(e) => setInputValue(parseInt(e.currentTarget.value))} />
                <ButtonContainer>
                    <button className={Button} onClick={() => setCarouselInterval(inputValue!)}>
                        Change interval
                    </button>
                    <button className={ButtonTwo} onClick={() => setCarouselStop(!carouselStop)}>
                        {carouselStop ? 'Turn ON' : 'Turn OFF'}
                    </button>
                </ButtonContainer>
            </ControllerHolder>
        </Background>
    );
};

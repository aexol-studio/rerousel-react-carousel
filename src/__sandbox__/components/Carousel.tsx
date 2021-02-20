import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import { wordCarouselItems } from '@/__sandbox__/assets/data';
import styled from 'styled-components';

export const Carousel = () => {
    const wordsCarouselRef = useRef(null);

    const WordsCarouselBackground = styled.div`
        background-color: #20232a;
        width: 100%;
    `;

    const WordsCarousel = styled.div`
        background-color: #20232a;
        color: white;
        max-width: 1150px;
        margin: auto;
    `;

    const Item = styled.div`
        display: flex;
        justify-content: center;
        width: calc(100% / 4);
        font-size: 13px;
        font-family: Raleway, sans-serif;

        @media (max-width: 1400px) {
            width: calc(100% / 3);
        }

        @media (max-width: 1000px) {
            width: calc(100% / 2);
        }

        @media (max-width: 700px) {
            width: 100%;
        }
    `;

    return (
        <WordsCarouselBackground>
            <WordsCarousel>
                <Rerousel itemRef={wordsCarouselRef} interval={3000}>
                    {wordCarouselItems.map((item, idx) => {
                        return (
                            <Item ref={wordsCarouselRef} key={idx}>
                                <div>
                                    <h1>{item}</h1>
                                </div>
                            </Item>
                        );
                    })}
                </Rerousel>
            </WordsCarousel>
        </WordsCarouselBackground>
    );
};

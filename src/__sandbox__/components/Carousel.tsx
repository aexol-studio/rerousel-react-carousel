import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import { wordCarouselItems } from '@/__sandbox__/assets/data';

import { style } from 'typestyle';
import styled from 'styled-components';

export const Carousel = () => {
    const wordsCarouselRef = useRef(null);

    const WordsCarousel = style({
        backgroundColor: '#20232A',
        color: '#FFF',
        padding: '0 20%',
        margin: 'auto',
    });

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
        <div className={WordsCarousel}>
            <Rerousel itemRef={wordsCarouselRef} interval={2000}>
                {wordCarouselItems.map((item, idx) => {
                    return (
                        <Item ref={wordsCarouselRef} key={idx}>
                            <div className="item_gif">
                                <h1 className="item__header">{item}</h1>
                            </div>
                        </Item>
                    );
                })}
            </Rerousel>
        </div>
    );
};

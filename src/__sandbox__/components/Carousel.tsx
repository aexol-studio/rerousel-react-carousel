import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import { wordCarouselItems } from '@/__sandbox__/assets/data';

import { style, media } from 'typestyle';

export const Carousel = () => {
    const wordsCarouselRef = useRef(null);

    const WordsCarousel = style({
        padding: '0 18%',
        backgroundColor: '#20232A',
        color: '#FFF',
    });

    const CarouselItem = style(
        {
            display: 'flex',
            justifyContent: 'center',
            width: 'calc(100% / 4)',
            fontSize: '13px',
            fontFamily: 'Raleway, sans-serif',
        },
        media({ maxWidth: 1400 }, { width: 'calc(100% / 3)' }),
        media({ maxWidth: 1000 }, { width: 'calc(100% / 2)' }),
        media({ maxWidth: 700 }, { width: '100%' }),
    );

    return (
        <div className={WordsCarousel}>
            <Rerousel itemRef={wordsCarouselRef} interval={2000}>
                {wordCarouselItems.map((item, idx) => {
                    return (
                        <div ref={wordsCarouselRef} className={CarouselItem} key={idx}>
                            <div className="item_gif">
                                <h1 className="item__header">{item}</h1>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>
        </div>
    );
};

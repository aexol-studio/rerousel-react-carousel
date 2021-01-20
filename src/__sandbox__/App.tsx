import React from 'react';
import { Rerousel } from '@/pkg';
import { useWindowSize } from './useWindowSize';
import { FullWidthCarouselData, CustomWidthCarouselData } from '../__sandbox__/assets/data';
import './App.css';

export const App = () => {
    const { width } = useWindowSize();

    return (
        <>
            <h1 className="example__header">Full-width carousel using useWindowSize() hook</h1>
            <Rerousel itemWidth={width} interval={2000}>
                {FullWidthCarouselData.map((item) => {
                    return (
                        <div className="wrapper">
                            <div className="item">
                                <h1 className="item__header">{item.itemHeader}</h1>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>

            <h1 className="example__header">Custom width carousel using useWindowSize() hook</h1>
            <Rerousel itemWidth={450} interval={2000}>
                {CustomWidthCarouselData.map((item) => {
                    return (
                        <div className="wrapper_custom">
                            <div className="item">
                                <h1 className="item__header">{item.itemHeader}</h1>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>
        </>
    );
};

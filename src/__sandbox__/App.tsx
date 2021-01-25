import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import { FullWidthCarouselData, CustomWidthCarouselData, itemsTest } from '@/__sandbox__/assets/data';
import './App.css';

export const App = () => {
    const itemRef = useRef(null);
    const itemTwoRef = useRef(null);
    const itemThreeRef = useRef(null);

    return (
        <>
            <h1 className="example__header">Full-width carousel</h1>
            <Rerousel itemRef={itemRef} interval={2000}>
                {FullWidthCarouselData.map((item, idx) => {
                    return (
                        <div ref={itemRef} className="wrapper" key={idx}>
                            <div className="item">
                                <h1 className="item__header">{item.itemHeader}</h1>
                                <p>{item.itemContent}</p>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>

            <h1 className="example__header">Custom width carousel</h1>
            <Rerousel itemRef={itemTwoRef} interval={2000}>
                {CustomWidthCarouselData.map((item, idx) => {
                    return (
                        <div ref={itemTwoRef} className="wrapper_custom" key={idx}>
                            <div className="item">
                                <h1 className="item__header">{item.itemHeader}</h1>
                                <p>{item.itemContent}</p>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>

            <Rerousel itemRef={itemThreeRef} interval={2000}>
                {itemsTest.map((item, idx) => {
                    return (
                        <div ref={itemThreeRef} className="wrapper_gif" key={idx}>
                            <div className="item_gif">
                                <h1 className="item__header">{item}</h1>
                            </div>
                        </div>
                    );
                })}
            </Rerousel>
        </>
    );
};

import React, { useRef } from 'react';
import { Rerousel } from '@/Rerousel';
import { FullWidthCarouselData, CustomWidthCarouselData } from '@/__sandbox__/assets/data';
import './App.css';

export const App = () => {
    const itemRef = useRef(null);
    const itemTwoRef = useRef(null);

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
        </>
    );
};

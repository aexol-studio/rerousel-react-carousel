import React, { useRef } from 'react';
import { Rerousel } from '@/index';
import { itemsTest } from '@/__sandbox__/assets/data';
import { style } from 'typestyle';

import Navbar from './components/Navbar';

style({
    $nest: {
        'html, body': {
            margin: '0',
            padding: '0',
            backgroundColor: '#F0F0F0',
        },
    },
});

export const App = () => {
    const itemThreeRef = useRef(null);

    return (
        <>
            <Navbar />

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

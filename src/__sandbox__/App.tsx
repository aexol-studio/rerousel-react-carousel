import React from 'react';
import { style } from 'typestyle';

import { Navbar, Hero, Carousel, Description } from './components';

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
    return (
        <>
            <Navbar />
            <Hero />
            <Carousel />
            <Description />
        </>
    );
};

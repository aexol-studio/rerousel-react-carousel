import React from 'react';
import { style } from 'typestyle';
import { Navbar, Hero, Carousel, Description, Content } from './components';

style({
    $nest: {
        'html, body': {
            margin: '0',
            padding: '0',
            backgroundColor: '#F0F0F0',
            height: '2000px',
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
            <Content />
        </>
    );
};

import React from 'react';
import { media, style } from 'typestyle';
import { descriptionData } from '../assets/data';

const Container = style(
    {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        margin: '70px auto',
        maxWidth: '1100px',
    },
    media({ maxWidth: 1150 }, { margin: '40px auto' }),
);

const Column = style(
    {
        maxWidth: '300px',
        fontFamily: 'Signika',
        fontStyle: 'normal',
    },
    media({ maxWidth: 1150 }, { margin: 'auto', padding: '0 3%' }),
    media({ maxWidth: 500 }, { padding: '5%' }),
);

const Header = style({
    fontWeight: 'normal',
    fontSize: '25px',
    lineHeight: '31px',
    color: '#797979',
});

const Paragraph = style({
    fontWeight: 'lighter',
    fontSize: '1.1em',
    lineHeight: '170%',
    textAlign: 'justify',
});

export const Description = () => {
    return (
        <div className={Container}>
            {descriptionData.map((desc, idx) => {
                return (
                    <div className={Column} key={idx}>
                        <h1 className={Header}>{desc.header}</h1>
                        <p className={Paragraph}>{desc.description}</p>
                    </div>
                );
            })}
        </div>
    );
};

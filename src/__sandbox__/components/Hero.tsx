import React from 'react';
import { media, style } from 'typestyle';

import rerousel_logo from '../../__sandbox__/assets/images/rerousel-logo.svg';

const Container = style(
    {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        backgroundColor: '#282C34',
        paddingTop: '70px',
    },
    media({ maxWidth: 800 }, {  height: '350px' }),
);

const HeroItems = style({
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
});

const Logo = style(
    {
        height: '200px',
    }, 
    media({ maxWidth: 800 }, { width: '300px' }),
 );

const Button = style(
    {
        height: '60px',
        width: '200px',
        backgroundColor: 'transparent',
        border: '4px solid #61DAFB',
        borderRadius: '10px',
        color: '#FFF',
        fontFamily: 'Signika, sans-serif',
        fontSize: '18px',
        fontWeight: 'lighter',
        transition: '0.5s',
        marginTop: '20px',
        cursor: 'pointer',
        $nest: {
            '&:hover': {
                backgroundColor: '#61DAFB',
                color: '#000',
                fontWeight: 'bold',
            }
        }
    },
    media({ maxWidth: 800 }, {  marginTop: '10px', height: '50px', width: '200px', fontSize: '15px',
}),
);

export const Hero = () => {
    return (
        <div className={Container}>
            <div className={HeroItems}>
                <img className={Logo} src={rerousel_logo} />
                <button onClick = { () => window.open('https://github.com/aexol-studio/rerousel#how-to-use')}className={Button}>Show me the way ></button>
            </div>
        </div>
    );
};

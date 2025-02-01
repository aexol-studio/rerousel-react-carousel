import React from 'react';
import { style, media } from 'typestyle';

import NpmSvg from '../assets/svg/NpmSvg';
import GithubSvg from '../assets/svg/GithubSvg';

const Container = style({
    position: 'fixed',
    zIndex: '999',
    width: '100%',
    height: '70px',
    backgroundColor: '#20232A',
});

const Navigation = style(
    {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1100px',
        margin: 'auto',
        height: '100%',
    },
    media({ maxWidth: 1150 }, { margin: '0 5%' }),
);

const Logo = style({
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 'bold',
    fontSize: '25px',
    color: '#FFF',
    transition: '0.3s',
    $nest: {
        '&:hover': {
            color: '#61DAFB',
        },
    },
});

const ToTop = style({
    textDecoration: 'none',
});

const Links = style({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
});

export const Navbar = () => {
    return (
        <div className={Container}>
            <div className={Navigation}>
                <a className={ToTop} href="#">
                    <h1 className={Logo}>REROUSEL</h1>
                </a>

                <div className={Links}>
                    <a href="https://www.npmjs.com/package/rerousel">
                        <NpmSvg />
                    </a>

                    <a href="https://github.com/aexol-studio/rerousel">
                        <GithubSvg />
                    </a>
                </div>
            </div>
        </div>
    );
};

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
});

const Links = style({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
});

const Icon = style({
    width: '20px',
    margin: '10px',
});

export const Navbar = () => {
    return (
        <div className={Container}>
            <div className={Navigation}>
                <h1 className={Logo}>REROUSEL</h1>

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

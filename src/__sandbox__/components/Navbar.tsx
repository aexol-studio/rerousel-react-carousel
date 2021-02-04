import React from 'react';
import { style, media } from 'typestyle';

import npm_logo from '../../__sandbox__/assets/images/npm-logo.svg';
import github_logo from '../../__sandbox__/assets/images/github-logo.svg';

const Container = style({
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
                        <img src={npm_logo} className={Icon} style={{ marginTop: '15px', width: '40px' }} />
                    </a>

                    <a href="https://github.com/aexol-studio/rerousel">
                        <img src={github_logo} className={Icon} style={{ margin: '10px 0px 10px 10px' }} />
                    </a>
                </div>
            </div>
        </div>
    );
};

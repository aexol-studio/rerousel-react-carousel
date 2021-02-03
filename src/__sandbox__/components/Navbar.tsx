import React from 'react';
import { style } from 'typestyle';

import npm_logo from '../../__sandbox__/assets/images/npm-logo.svg';
import github_logo from '../../__sandbox__/assets/images/github-logo.svg';

const Container = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 18%',
    height: '70px',
    backgroundColor: '#20232A',
});

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

function Navbar() {
    return (
        <div className={Container}>
            <h1 className={Logo}>REROUSEL</h1>

            <div className={Links}>
                <img src={npm_logo} className={Icon} style={{ width: '40px' }} />
                <img src={github_logo} className={Icon} />
            </div>
        </div>
    );
}

export default Navbar;

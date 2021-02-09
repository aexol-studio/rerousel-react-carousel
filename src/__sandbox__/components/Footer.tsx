import React from 'react';
import styled from 'styled-components';

const Container = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    background-color: #20232a;
    padding: 20px;
`;

const Copyright = styled.a`
    color: white;
    font-family: Signika, sans-serif;
    font-weight: normal;
    text-align: center;
`;

export const Footer = () => {
    return (
        <Container>
            <Copyright href="https://aexol.com/">Aexol - Innovative Software Development studio © 2020</Copyright>
        </Container>
    );
};

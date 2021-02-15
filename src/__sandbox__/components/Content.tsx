import React, { useRef } from 'react';

import { style, media } from 'typestyle';
import styled from 'styled-components';
import { Rerousel } from '@/index';
import oceanic from 'prism-react-renderer/themes/oceanicNext';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const EditorContainer = style(
    {
        width: '1100px',
        height: '500px',
        margin: 'auto',
        borderRadius: '10px',
        overflowY: 'auto',
        maxHeight: 'calc(100% - 50px)',
    },
    media({ maxWidth: 1150 }, { width: '90%' }),
);

const EditorHeader = style({
    height: '50px',
    backgroundColor: '#20232A',
    borderRadius: '10px 10px 0 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 'bold',
});

const Editor = style({
    width: '100%',
    fontSize: '14px',
    borderRadius: '0 0 10px 10px',
});

const PreviewContainer = style(
    {
        backgroundColor: 'white',
        width: '1100px',
        margin: '50px auto',
        borderRadius: '10px',
    },
    media({ maxWidth: 1150 }, { width: '90%' }),
);

const PreviewHeader = style({
    height: '50px',
    backgroundColor: 'gray',
    borderRadius: '10px 10px 0 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 'bold',
});

const scope = { Rerousel, useRef, styled };

const code = `function App() {
  const ref = useRef(null);

  const Item = styled.div\`
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% / 2);
    height: 100px;
    font-family: Signika;
    font-weight: bold;
    font-size: 1.5em;
    border: solid 3px black;
    background-color: #61DAFB;
  \`;

  return (
    <div>
      <header>
        
        <Rerousel itemRef={ref}>
          <Item ref={ref}>1</Item>
          <Item>2</Item>
          <Item>3</Item>
          <Item>4</Item>
          <Item>5</Item>
        </Rerousel>
        
      </header>
    </div>
  );
}`;

export const Content = () => {
    return (
        <LiveProvider scope={scope} theme={oceanic} code={code}>
            <div className={EditorContainer}>
                <header className={EditorHeader}>REROUSEL SANDBOX</header>
                <LiveEditor className={Editor} />
            </div>
            <div className={PreviewContainer}>
                <header className={PreviewHeader}>REROUSEL PREVIEW</header>
                <LivePreview />
            </div>
        </LiveProvider>
    );
};

import React, { useRef } from 'react';

import { style, media } from 'typestyle';
import styled from 'styled-components';
import { Rerousel } from '@/index';
import oceanic from 'prism-react-renderer/themes/oceanicNext';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const EditorContainer = styled.div`
    width: 1100px;
    height: 500px;
    margin: auto;
    border-radius: 10px;
    overflow-y: auto;
    max-height: calc(100% - 50px);

    @media (max-width: 1150px) {
        width: 90%;
    }
`;

const EditorHeader = styled.div`
    height: 50px;
    background-color: #20232a;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: Raleway, sans-serif;
    font-weight: bold;
`;

const Editor = style({
    width: '100%',
    fontSize: '14px',
    borderRadius: '0 0 10px 10px',
});

const PreviewContainer = styled.div`
    background-color: white;
    width: 1100px;
    margin: 50px auto;
    border-radius: 10px;

    @media (max-width: 1150px) {
        width: 90%;
    }
`;

const PreviewHeader = styled.div`
    height: 50px;
    background-color: gray;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: Raleway, sans-serif;
    font-weight: bold;
`;

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
    border: solid 1px black;
    background-color: #61DAFB;
  \`;

  return (
    <Rerousel itemRef={ref}>
      <Item ref={ref}>1</Item>
      <Item>2</Item>
      <Item>3</Item>
      <Item>4</Item>
      <Item>5</Item>
    </Rerousel>
  );
}`;

export const Content = () => {
    return (
        <LiveProvider scope={scope} theme={oceanic} code={code}>
            <EditorContainer>
                <EditorHeader>REROUSEL SANDBOX</EditorHeader>
                <LiveEditor className={Editor} />
            </EditorContainer>
            <PreviewContainer>
                <PreviewHeader>REROUSEL PREVIEW</PreviewHeader>
                <LivePreview />
            </PreviewContainer>
        </LiveProvider>
    );
};

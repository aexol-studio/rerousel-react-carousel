import React, { useRef } from 'react';

import { style } from 'typestyle';
import { Rerousel } from '@/index';
import oceanic from 'prism-react-renderer/themes/oceanicNext';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const EditorContainer = style({
    width: '1100px',
    height: '500px',
    margin: 'auto',
    borderRadius: '10px',
});

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
    height: 'calc(100% - 50px)',
    width: '100%',
    fontSize: '14px',
    borderRadius: '0 0 10px 10px',
});

const PreviewContainer = style({
    backgroundColor: 'white',
    width: '1100px',
    margin: '50px auto',
    borderRadius: '10px',
});

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

const scope = { Rerousel, useRef };

const code = `function App() {
  const ref = useRef(null);

  return (
    <div>
      <header>
        
        <Rerousel itemRef={ref}>
          <div ref={ref} style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test1</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test2</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test3</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test4</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test5</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test6</div>
          <div style={{width: '50%', testAlign:'center', backgroundColor: 'red'}}>test7</div>
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

import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Rerousel, type RerouselHandle } from 'rerousel';
import './fixture.css';

function Slide({ index }: { index: number }) {
  const [count, setCount] = useState(0);
  const mounts = useRef(0);
  useEffect(() => {
    mounts.current++;
  }, []);
  return (
    <article className="fixture-slide" data-slide={index}>
      <h2>Slide {index}</h2>
      <button onClick={() => setCount(count + 1)}>
        Count {index}: {count}
      </button>
      <label htmlFor={`note-${index}`}>Note {index}</label>
      <input id={`note-${index}`} name={`note-${index}`} />
      <a href={`#slide-${index}`}>Link {index}</a>
    </article>
  );
}
function Fixture() {
  const params = new URLSearchParams(location.search);
  const ref = useRef<RerouselHandle>(null);
  const [stop, setStop] = useState(params.get('auto') !== 'true');
  const [loop, setLoop] = useState(true);
  const [count, setCount] = useState(Number(params.get('count')) || 4);
  const [wide, setWide] = useState(false);
  return (
    <main>
      <h1>Carousel regression fixture</h1>
      <div className="controls">
        <button onClick={() => ref.current?.previous()}>Previous</button>
        <button onClick={() => ref.current?.next()}>Next</button>
        <button onClick={() => setStop(!stop)}>{stop ? 'Play' : 'Pause'}</button>
        <button onClick={() => setLoop(!loop)}>Loop: {String(loop)}</button>
        <button onClick={() => setCount(count > 1 ? count - 1 : 4)}>Remove slide</button>
        <button onClick={() => setWide(!wide)}>Resize</button>
      </div>
      <div
        className={wide ? 'fixture-width wide' : 'fixture-width'}
        style={params.has('width') ? { width: `min(${Number(params.get('width'))}px, 100%)` } : undefined}
      >
        <Rerousel
          ref={ref}
          aria-label="Fixture carousel"
          stop={stop}
          loop={loop}
          pauseOnHover={params.get('hover') !== 'false'}
          interval={Number(params.get('interval')) || 1000}
          itemWidth={Number(params.get('itemWidth')) || undefined}
          behavior={params.get('behavior') === 'instant' ? 'instant' : 'smooth'}
          dir={params.get('rtl') === 'true' ? 'rtl' : 'ltr'}
          style={{
            gap: params.has('gap') ? Number(params.get('gap')) : 16,
            scrollBehavior: params.get('cssSmooth') === 'true' ? 'smooth' : undefined,
          }}
        >
          {Array.from({ length: count }, (_, index) => (
            <Slide key={index} index={index} />
          ))}
        </Rerousel>
      </div>
      <button
        onClick={() => {
          document.getElementById('fixture')!.dataset.outside = 'clicked';
        }}
      >
        Outside
      </button>
    </main>
  );
}
createRoot(document.getElementById('fixture')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);

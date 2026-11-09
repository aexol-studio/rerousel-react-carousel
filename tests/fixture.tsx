import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Rerousel, type RerouselHandle } from 'rerousel';
import './fixture.css';

function NestedCarousel() {
  const ref = useRef<RerouselHandle>(null);
  return (
    <>
      <button onClick={() => ref.current?.next()}>Next nested slide</button>
      <Rerousel ref={ref} aria-label="Nested carousel" stop style={{ width: '100%', gap: 8 }}>
        {Array.from({ length: 4 }, (_, index) => (
          <div data-nested-slide={index} key={index} style={{ width: 120, minHeight: 80 }}>
            Nested {index}
            {index === 0 && <input aria-label="Nested note" />}
          </div>
        ))}
      </Rerousel>
    </>
  );
}
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
      {index === 0 && new URLSearchParams(location.search).has('nested') && <NestedCarousel />}
    </article>
  );
}
function Fixture() {
  const params = new URLSearchParams(location.search);
  const ref = useRef<RerouselHandle>(null);
  const [stop, setStop] = useState(params.get('auto') !== 'true');
  const [loop, setLoop] = useState(params.get('loop') !== 'false');
  const [count, setCount] = useState(Number(params.get('count')) || 4);
  const [wide, setWide] = useState(false);
  const [shown, setShown] = useState(true);
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
        {params.has('cleanup') && <button onClick={() => setShown(false)}>Unmount carousel</button>}
      </div>
      <div
        className={wide ? 'fixture-width wide' : 'fixture-width'}
        style={params.has('width') ? { width: `min(${Number(params.get('width'))}px, 100%)` } : undefined}
      >
        {shown && (
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
        )}
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

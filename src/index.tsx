import React, { useEffect, useCallback, useState, useRef, Children, RefObject } from 'react';
import { style } from 'typestyle';

interface RerouselProps {
    itemWidth?: number;
    itemRef: RefObject<HTMLElement>;
    interval?: number;
    stop?: boolean;
    children: React.ReactNode;
}

const wrapperStyle = style({
    display: 'flex',
    alignItems: 'center',
    overflowX: 'scroll',
    height: '100%',
    scrollSnapType: 'x mandatory',
    '-webkit-overflow-scrolling': 'touch',
    flexFlow: 'row nowrap',
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
    $nest: {
        '& > *': {
            boxSizing: 'border-box',
            flexShrink: 0,
        },
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
});

const useWidth = (elementRef: RefObject<HTMLElement>) => {
    const [width, setWidth] = useState<number>(0);

    const updateWidth = useCallback(() => {
        if (elementRef.current) {
            setWidth(elementRef.current.getBoundingClientRect().width);
        }
    }, [elementRef]);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [updateWidth]);

    return width;
};

export const Rerousel: React.FC<RerouselProps> = ({ children, itemRef, interval = 3000, stop = false }) => {
    const itemWidth = useWidth(itemRef);
    const [currentScrollLeft, setCurrentScrollLeft] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const childCount = Children.count(children);

    useEffect(() => {
        if (!wrapperRef.current) return;

        if (currentScrollLeft === 0) {
            wrapperRef.current.scrollTo({ left: 0 });
            setCurrentScrollLeft(1);
        } else if (currentScrollLeft > childCount) {
            setCurrentScrollLeft(0);
        } else if (itemWidth) {
            wrapperRef.current.scrollTo({
                left: itemWidth * currentScrollLeft,
                behavior: 'smooth',
            });
        }
    }, [currentScrollLeft, itemWidth, childCount]);

    useEffect(() => {
        if (stop) return;

        let intervalId: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                intervalId = setInterval(() => {
                    setCurrentScrollLeft((prev) => prev + 1);
                }, interval);
            } else {
                clearInterval(intervalId);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        handleVisibilityChange();

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [interval, stop]);

    return (
        <div className={wrapperStyle} ref={wrapperRef}>
            {children}
            {children}
        </div>
    );
};

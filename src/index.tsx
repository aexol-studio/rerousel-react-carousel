import React, { useEffect, useCallback, useState, useRef, Children, RefObject } from 'react';
import { style } from 'typestyle';

interface RerouselProps {
    itemWidth?: number;
    itemRef: RefObject<HTMLElement>;
    interval?: number;
    stop?: boolean;
    children: React.ReactNode;
}

const wrapper = style({
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
            const { width } = elementRef.current.getBoundingClientRect();
            setWidth(width);
        }
    }, [elementRef]);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, [updateWidth]);

    return width;
};

export const Rerousel: React.FC<RerouselProps> = ({ children, itemRef, interval = 500, stop = false }) => {
    const itemWidth = useWidth(itemRef);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [currentScrollLeft, setCurrentScrollLeft] = useState<number>(0);
    const cc = Children.count(children);

    const scrollToNextItem = useCallback(() => {
        if (wrapperRef.current && itemWidth) {
            let nextScrollLeft = currentScrollLeft + 1;
            // Ensure we stay within bounds and don't scroll backward
            if (nextScrollLeft >= cc) {
                nextScrollLeft = currentScrollLeft; // Prevent scrolling backward
            }

            wrapperRef.current.scrollTo({
                left: itemWidth * nextScrollLeft,
                behavior: 'smooth',
            });
            setCurrentScrollLeft(nextScrollLeft);
        }
    }, [currentScrollLeft, itemWidth, cc]);

    useEffect(() => {
        if (!stop) {
            const intervalId = setInterval(scrollToNextItem, interval);
            return () => clearInterval(intervalId);
        }
    }, [scrollToNextItem, interval, stop]);

    return (
        <div className={wrapper} ref={wrapperRef}>
            {children}
            {children}
        </div>
    );
};
